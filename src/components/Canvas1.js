import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../core/store';
import { dragDropService } from '../core/dragDropService';
import Button from '../widgets/Button';
import Input from '../widgets/Input';
import Select from '../widgets/Select';
import Switch from '../widgets/Switch';
import Slider from '../widgets/Slider';
import DatePicker from '../widgets/DatePicker';
import Row from '../widgets/Row';
import Col from '../widgets/Col';

const componentTypesMap = {
    'BUTTON': Button,
    'INPUT': Input,
    'SELECT': Select,
    'SWITCH': Switch,
    'SLIDER': Slider,
    'DATEPICKER': DatePicker,
    'ROW': Row,
    'COL': Col
};

// 递归渲染组件树
const renderComponentTree = (comp, components, selectedComponentId, setSelectedComponent, depth = 0) => {
    // 创建组件ID映射提高查找效率
    const componentMap = {};
    components.forEach(c => componentMap[c.id] = c);

    // 渲染当前组件（统一转换为大写匹配）
    const normalizedType = comp.type.toUpperCase();
    const Component = componentTypesMap[normalizedType];
    if (!Component) {
        return (
            <div key={comp.id} style={{
                padding: '10px',
                backgroundColor: '#ffebee',
                border: '1px solid #f44336'
            }}>
                未知组件: {comp.type} (映射类型: {normalizedType})
            </div>
        );
    }

    // 收集子组件
    let childElements = null;
    if (Array.isArray(comp.childrenIds) && comp.childrenIds.length > 0) {
        childElements = comp.childrenIds
            .map(childId => componentMap[childId])
            .filter(childComp => childComp && childComp.parentId === comp.id)
            .map(childComp => renderComponentTree(childComp, components, selectedComponentId, setSelectedComponent, depth + 1));
    }

    return (
        <div
            key={comp.id}
            style={{
                position: 'relative',
                padding: '10px',
                marginLeft: `${depth * 20}px`, // 缩进表示嵌套深度
                border: selectedComponentId === comp.id ? '2px solid #1890ff' : '1px dashed #ddd',
                borderRadius: '4px',
                backgroundColor: selectedComponentId === comp.id ? '#f0f9ff' : 'transparent',
                cursor: 'move'
            }}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedComponent(comp.id);
            }}
        >
            {/* 组件深度指示器 */}
            <div style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                fontSize: '10px',
                color: '#666',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '2px 4px',
                borderRadius: '3px',
                zIndex: 10
            }}>
                L{depth}
            </div>

            {/* 组件ID标签 */}
            <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                fontSize: '10px',
                color: '#666',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '2px 4px',
                borderRadius: '3px',
                zIndex: 10
            }}>
                {comp.id}
            </div>

            {/* 渲染组件本身 */}
            <Component {...comp.props} id={comp.id}>
                {childElements}
            </Component>
        </div>
    );
};

export default function Canvas() {
    const currentPage = useStore((state) => state.getCurrentPage());
    const components = currentPage ? currentPage.components : [];
    const addComponent = useStore((state) => state.addComponent);
    const selectedComponentId = useStore((state) => state.selectedComponentId);
    const setSelectedComponent = useStore((state) => state.setSelectedComponent);
    const undo = useStore((state) => state.undo);
    const redo = useStore((state) => state.redo);
    const undoStack = useStore((state) => state.undoStack);
    const redoStack = useStore((state) => state.redoStack);
    const [fontFamily, setFontFamily] = useState('Arial, sans-serif');

    // 监听全局字体变化
    useEffect(() => {
        const unsubscribe = useStore.subscribe(
            state => state.apiData?.globalFont,
            (font) => {
                if (font) setFontFamily(font);
            }
        );
        return unsubscribe;
    }, []);

    // 初始化拖拽服务
    useEffect(() => {
        dragDropService.enableReactDnD();
    }, []);

    // 点击画布空白处取消选择组件
    const handleCanvasClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedComponent(null);
        }
    };

    // React DnD放置处理
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'widget',
        drop: (item, monitor) => {
            const dropTarget = monitor.getDropResult();
            dragDropService.handleDrop(dropTarget);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver()
        })
    }));

    const lastAction = useStore((state) => state.lastAction);
    const lastActionData = useStore((state) => state.lastActionData);

    return (
        <div
            ref={drop}
            className={`canvas ${isOver ? 'active' : ''}`}
            style={{
                minHeight: '500px',
                border: '2px dashed #ccc',
                padding: '20px',
                backgroundColor: isOver ? '#f0f9ff' : 'white',
                cursor: 'default',
                fontFamily: fontFamily
            }}
            onClick={handleCanvasClick}
        >
            {/* 状态监控面板 */}
            <div style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f8f8f8',
                borderRadius: '4px'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>组件状态监控</div>
                <div style={{ fontSize: '12px' }}>
                    当前组件数: {components.length} |
                    选中的组件: {selectedComponentId || '无'} |
                    最后操作: {lastAction || '无'} |
                    嵌套深度: {components.filter(c => c.parentId).length}层
                </div>
            </div>

            {/* 操作栏 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
            }}>
                <div style={{ fontWeight: 'bold' }}>设计画布</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={undo}
                        disabled={undoStack.length === 0}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: undoStack.length === 0 ? '#f5f5f5' : '#1890ff',
                            color: undoStack.length === 0 ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        撤销
                    </button>
                    <button
                        onClick={redo}
                        disabled={redoStack.length === 0}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: redoStack.length === 0 ? '#f5f5f5' : '#1890ff',
                            color: redoStack.length === 0 ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        重做
                    </button>
                </div>
            </div>

            {components.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>
                    将组件拖拽到此处
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* 只渲染根组件（无父组件的组件） */}
                    {components
                        .filter(comp => !comp.parentId)
                        .map(comp => renderComponentTree(comp, components, selectedComponentId, setSelectedComponent))}
                </div>
            )}
        </div>
    );
}
