import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { APIConnector } from './apiConnector';
import { parseSchema } from './schemaParser/SchemaParser'; // 使用新的Schema解析器

// 辅助函数：根据路径更新嵌套对象
const updateNestedObject = (obj, path, value) => {
    const pathParts = path.split(/[.[\]]/).filter(part => part !== '');

    // 如果是根属性
    if (pathParts.length === 0) return value;

    const [head, ...rest] = pathParts;

    if (rest.length === 0) {
        return { ...obj, [head]: value };
    }

    return {
        ...obj,
        [head]: updateNestedObject(obj[head] || {}, rest.join('.'), value)
    };
};

// 最大历史记录步数
const MAX_HISTORY_STEPS = 100;

export const useStore = create((set, get) => ({
    pages: [
        {
            id: 'page1',
            name: '首页',
            components: []
        }
    ],
    currentPageId: 'page1',
    mode: 'design', // 'design' 或 'preview'

    // AI会话状态
    aiSession: {
        id: null,      // 会话ID
        context: []    // 上下文历史
    },
    selectedComponentId: null,
    undoStack: [], // 撤销栈
    redoStack: [], // 重做栈
    lastAction: null, // 最后操作类型
    lastActionData: null, // 最后操作详情

    // 属性变更监听器 {componentId: string, callback: function}
    propertyListeners: [],

    // 添加属性变更监听器
    addPropertyListener: (componentId, callback) => {
        set(state => ({
            propertyListeners: [...state.propertyListeners, { componentId, callback }]
        }));
    },

    // 移除属性变更监听器
    removePropertyListener: (listenerId) => {
        set(state => ({
            propertyListeners: state.propertyListeners.filter(listener => listener !== listenerId)
        }));
    },

    // 通知属性变更
    notifyPropertyChange: (componentId) => {
        const state = get();
        const component = state.getCurrentPage()?.components.find(c => c.id === componentId);
        if (component) {
            state.propertyListeners.forEach(listener => {
                if (listener.componentId === componentId) {
                    listener.callback(component.props);
                }
            });
        }
    },

    // 保存当前状态快照
    saveSnapshot: () => {
        const currentState = get();
        const snapshot = JSON.parse(JSON.stringify(currentState.pages));
        return snapshot;
    },

    // 初始化AI会话
    initAISession: () => {
        const currentSession = get().aiSession;
        return currentPage ? currentPage.components : [];
    },

    // 添加组件（支持传统拖拽和JSON Schema两种方式）
    addComponent: (componentData) =>
        set((state) => {
            console.log('Adding component:', componentData.type || 'from schema', 'parentId:', componentData.parentId);
            const snapshot = state.saveSnapshot();

            // 数据格式兼容处理
            const normalizedComponent = { ...componentData };

            // 转换defaultProps为props（兼容旧格式）
            if (normalizedComponent.defaultProps && !normalizedComponent.props) {
                normalizedComponent.props = normalizedComponent.defaultProps;
                delete normalizedComponent.defaultProps;
            }

            // 直接使用传入数据创建组件
            const newComponent = {
                type: normalizedComponent.type,
                props: normalizedComponent.props || {},
                id: uuidv4(),
                parentId: normalizedComponent.parentId || null, // 保留传入的parentId
                childrenIds: []
            };
            console.log('New component created:', newComponent);

            const currentPage = state.getCurrentPage();
            if (!currentPage) {
                console.error('Current page not found');
                return state;
            }

            // 创建组件映射提高查找效率
            const componentMap = {};
            currentPage.components.forEach(comp => {
                componentMap[comp.id] = comp;
            });
            console.log('Existing components:', Object.keys(componentMap));

            // 深度复制组件数组
            let updatedComponents = [...currentPage.components];

            if (newComponent.parentId) {
                // 查找父组件
                const parentComp = componentMap[newComponent.parentId];
                if (parentComp) {
                    // 确保childrenIds是数组
                    const currentChildren = Array.isArray(parentComp.childrenIds)
                        ? parentComp.childrenIds
                        : [];

                    // 创建新的父组件引用
                    const updatedParent = {
                        ...parentComp,
                        childrenIds: [...currentChildren, newComponent.id]
                    };

                    // 创建新的组件数组引用
                    updatedComponents = updatedComponents.map(comp =>
                        comp.id === newComponent.parentId ? updatedParent : comp
                    );
                }
            }

            // 添加新组件
            updatedComponents.push(newComponent);
            console.log('Updated components list:', updatedComponents.map(c => ({ id: c.id, type: c.type, parentId: c.parentId })));

            const updatedPages = state.pages.map(page =>
                page.id === state.currentPageId
                    ? { ...page, components: updatedComponents }
                    : page
            );

            console.log('Final state before update:', {
                newComponentId: newComponent.id,
                parentId: newComponent.parentId,
                parentUpdated: newComponent.parentId ? updatedComponents.find(c => c.id === newComponent.parentId) : null,
                allComponents: updatedComponents.map(c => ({ id: c.id, type: c.type, parentId: c.parentId }))
            });

            // 通知属性变更
            state.notifyPropertyChange(newComponent.id);

            return {
                pages: updatedPages,
                undoStack: [...state.undoStack.slice(-MAX_HISTORY_STEPS + 1), snapshot],
                redoStack: [],
                selectedComponentId: newComponent.id, // 自动选中新添加的组件
                lastAction: `添加组件: ${newComponent.type}`,
                lastActionData: {
                    id: newComponent.id,
                    type: newComponent.type,
                    parentId: newComponent.parentId,
                    timestamp: new Date().toISOString()
                }
            };
        }),

    // 添加JSON Schema到画布
    addSchema: (schema) => {
        try {
            // 使用新的同步解析方法
            const componentTree = parseSchema(schema);

            // 递归添加组件
            const addComponents = (components, parentId = null) => {
                components.forEach(comp => {
                    // 添加当前组件（包含parentId）
                    get().addComponent({
                        type: comp.type,
                        props: comp.props,
                        parentId
                    });

                    // 递归添加子组件
                    if (comp.children && comp.children.length > 0) {
                        addComponents(comp.children, comp.id);
                    }
                });
            };

            addComponents(componentTree);
            return true;
        } catch (error) {
            console.error('添加Schema失败:', error);
            return false;
        }
    },

    updateComponent: (id, props) =>
        set((state) => {
            const snapshot = state.saveSnapshot();
            const currentPage = state.getCurrentPage();
            if (!currentPage) return state;

            const updatedComponents = currentPage.components.map(comp =>
                comp.id === id ? { ...comp, props } : comp
            );

            const updatedPages = state.pages.map(page =>
                page.id === state.currentPageId
                    ? { ...page, components: updatedComponents }
                    : page
            );

            // 通知属性变更
            state.notifyPropertyChange(id);

            return {
                pages: updatedPages,
                undoStack: [...state.undoStack.slice(-MAX_HISTORY_STEPS + 1), snapshot],
                redoStack: []
            };
        }),

    updateComponentProp: (id, propPath, value) =>
        set((state) => {
            const snapshot = state.saveSnapshot();
            const currentPage = state.getCurrentPage();
            if (!currentPage) return state;

            const updatedComponents = currentPage.components.map(comp => {
                if (comp.id === id) {
                    const updatedProps = updateNestedObject(comp.props, propPath, value);
                    return { ...comp, props: updatedProps };
                }
                return comp;
            });

            const updatedPages = state.pages.map(page =>
                page.id === state.currentPageId
                    ? { ...page, components: updatedComponents }
                    : page
            );

            // 通知属性变更
            state.notifyPropertyChange(id);

            return {
                pages: updatedPages,
                undoStack: [...state.undoStack.slice(-MAX_HISTORY_STEPS + 1), snapshot],
                redoStack: []
            };
        }),

    // 批量更新组件的所有属性
    updateComponentProps: (id, newProps) =>
        set((state) => {
            const snapshot = state.saveSnapshot();
            const currentPage = state.getCurrentPage();
            if (!currentPage) return state;

            const updatedComponents = currentPage.components.map(comp => {
                if (comp.id === id) {
                    return { ...comp, props: { ...comp.props, ...newProps } };
                }
                return comp;
            });

            const updatedPages = state.pages.map(page =>
                page.id === state.currentPageId
                    ? { ...page, components: updatedComponents }
                    : page
            );

            // 通知属性变更
            state.notifyPropertyChange(id);

            return {
                pages: updatedPages,
                undoStack: [...state.undoStack.slice(-MAX_HISTORY_STEPS + 1), snapshot],
                redoStack: []
            };
        }),

    setMode: (mode) => set({ mode }),
    setSelectedComponent: (id) => set({ selectedComponentId: id }),

    // 添加页面
    addPage: (name = `页面${get().pages.length + 1}`) =>
        set((state) => {
            const newPage = {
                id: uuidv4(),
                name,
                components: []
            };
            return {
                pages: [...state.pages, newPage],
                currentPageId: newPage.id
            };
        }),

    // 删除页面
    removePage: (pageId) =>
        set((state) => {
            if (state.pages.length <= 1) return state; // 至少保留一个页面

            const updatedPages = state.pages.filter(page => page.id !== pageId);
            const newCurrentPageId =
                state.currentPageId === pageId
                    ? updatedPages[0]?.id
                    : state.currentPageId;

            return {
                pages: updatedPages,
                currentPageId: newCurrentPageId
            };
        }),

    // 切换页面
    switchPage: (pageId) => set({ currentPageId: pageId }),

    // 导出配置为JSON
    exportConfig: () => JSON.stringify(get().pages),

    // 导入配置
    importConfig: (json) => {
        try {
            const pages = JSON.parse(json);
            set({ pages, currentPageId: pages[0]?.id || '' });
        } catch (error) {
            console.error('导入配置失败:', error);
        }
    },

    // 撤销操作
    undo: () =>
        set((state) => {
            if (state.undoStack.length === 0) return state;

            const snapshot = state.undoStack[state.undoStack.length - 1];
            const newUndoStack = state.undoStack.slice(0, -1);
            const currentSnapshot = state.saveSnapshot();

            return {
                pages: snapshot,
                undoStack: newUndoStack,
                redoStack: [...state.redoStack, currentSnapshot],
                selectedComponentId: null // 撤销后清除选中状态
            };
        }),

    // 重做操作
    redo: () =>
        set((state) => {
            if (state.redoStack.length === 0) return state;

            const snapshot = state.redoStack[state.redoStack.length - 1];
            const newRedoStack = state.redoStack.slice(0, -1);
            const currentSnapshot = state.saveSnapshot();

            return {
                pages: snapshot,
                undoStack: [...state.undoStack, currentSnapshot],
                redoStack: newRedoStack,
                selectedComponentId: null // 重做后清除选中状态
            };
        }),

    // 数据绑定相关状态和方法
    apiData: {}, // 存储API获取的数据 { [apiName]: data }
    loading: {}, // 加载状态 { [apiName]: boolean }
    error: {},   // 错误信息 { [apiName]: string }

    /**
     * 加载API数据
     * @param {string} apiName - 注册的API名称
     * @param {Object} [params] - 请求参数
     */
    fetchData: async (apiName, params = {}) => {
        set(state => ({
            loading: { ...state.loading, [apiName]: true },
            error: { ...state.error, [apiName]: null }
        }));

        try {
            const data = await APIConnector.call(apiName, params);
            set(state => ({
                apiData: { ...state.apiData, [apiName]: data },
                loading: { ...state.loading, [apiName]: false }
            }));
            return data;
        } catch (err) {
            set(state => ({
                error: { ...state.error, [apiName]: err.message },
                loading: { ...state.loading, [apiName]: false }
            }));
            throw err;
        }
    },

    /**
     * 清除API数据
     * @param {string} apiName - 要清除的API名称
     */
    clearData: (apiName) => {
        set(state => {
            const newApiData = { ...state.apiData };
            delete newApiData[apiName];
            return { apiData: newApiData };
        });
    }
}));
