import { useStore } from './store';

/**
 * 增强版拖拽服务 - 支持深度嵌套容器结构
 */
class DragDropService {
    constructor() {
        this.currentDragItem = null;
        this.dropHandlers = [];
        this.isReactDnDEnabled = false;
    }

    /**
     * 开始拖拽
     * @param {Object} item - 拖拽项数据
     * @param {Event} [event] - 原生拖拽事件
     */
    startDrag(item, event = null) {
        console.group('[DragDropService] 开始拖拽');
        // 深度克隆数据避免引用污染
        const cleanItem = JSON.parse(JSON.stringify(this.normalizeDragData(item)));

        // 安全删除所有可能的ID字段
        const idFields = ['id', '_id', 'componentId', 'uuid'];
        idFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(cleanItem, field)) {
                delete cleanItem[field];
            }
        });

        this.currentDragItem = cleanItem;

        if (event && event.dataTransfer) {
            event.dataTransfer.setData(
                'application/json',
                JSON.stringify(cleanItem)
            );
        }
        console.groupEnd();
    }

    /**
     * 处理放置事件（支持深度嵌套）
     * @param {Object} dropResult - react-dnd放置信息
     * @param {Event} [event] - 原生放置事件
     */
    handleDrop(dropResult = null, event = null) {
        console.group('[DragDropService] 处理放置事件');
        let dropData = this.currentDragItem;
        let parentId = null;

        // 原生拖拽模式：精确容器检测
        if (event && event.dataTransfer) {
            try {
                const jsonData = event.dataTransfer.getData('application/json');
                dropData = jsonData ? JSON.parse(jsonData) : null;

                // 深度容器检测：支持无限层级嵌套
                const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
                for (const element of elementsAtPoint) {
                    if (element.dataset.dropZone === "true") {
                        parentId = element.dataset.componentId;
                        console.log(`深度容器命中: ${element.dataset.componentType} (${parentId})`);
                        break;
                    }
                }
            } catch (e) {
                console.error('解析拖拽数据失败:', e);
            }
        }

        // React DnD模式：使用dropResult中的parentId
        if (dropResult && dropResult.parentId) {
            parentId = dropResult.parentId;
        }

        if (!dropData) {
            console.warn('无有效拖拽数据');
            console.groupEnd();
            return;
        }

        console.log('放置目标:', parentId ? `容器${parentId}` : '根画布');
        // 确保覆盖旧parentId（防止拖拽数据中的parentId覆盖新值）
        const newComponent = {
            ...dropData,
            parentId: parentId,  // 显式设置parentId
            childrenIds: []       // 初始化子组件数组
        };
        console.log('添加组件:', newComponent.type, '到', parentId || '根画布');
        useStore.getState().addComponent(newComponent);

        // 通知所有监听器
        this.dropHandlers.forEach(handler => handler(dropData, dropResult));

        console.log('组件添加成功');
        console.groupEnd();
        this.currentDragItem = null;

        // 开发环境调试信息
        if (process.env.NODE_ENV === 'development') {
            console.log('组件数据:', newComponent);
        }
    }

    /**
     * 启用React DnD模式
     */
    enableReactDnD() {
        this.isReactDnDEnabled = true;
        console.log('已启用React DnD模式');
    }

    /**
     * 数据标准化处理
     */
    normalizeDragData(data) {
        // 深拷贝数据避免污染原始对象
        const normalized = { ...data };

        // 确保删除所有ID字段
        delete normalized.id;
        delete normalized.componentId;
        delete normalized._id;

        // 兼容旧格式
        if (normalized.defaultProps && !normalized.props) {
            return {
                type: normalized.type,
                props: normalized.defaultProps
            };
        }

        // 返回清洁数据
        return {
            type: normalized.type,
            props: normalized.props || {}
        };
    }

    /**
     * 注册放置处理器
     * @param {Function} handler - 放置事件处理函数
     */
    registerDropHandler(handler) {
        this.dropHandlers.push(handler);
    }
}

// 导出单例实例
export const dragDropService = new DragDropService();
