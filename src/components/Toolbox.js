import React, { useState, useEffect } from 'react';
import AIGeneratePanel from './AIGeneratePanel';
import { dragDropService } from '../core/dragDropService';
import { getAllComponentTypes, getComponent } from '../core/schemaParser/ComponentRegistry';

export default function Toolbox() {
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [components, setComponents] = useState([]);

    useEffect(() => {
        // 动态获取所有组件类型
        const componentTypes = getAllComponentTypes();
        const componentList = componentTypes.map(type => {
            const Component = getComponent(type);
            return {
                type,
                name: getComponentDisplayName(type),
                element: <Component preview={true} />
            };
        });
        setComponents(componentList);
    }, []);

    // 获取组件显示名称（使用大写键名）
    const getComponentDisplayName = (type) => {
        const nameMap = {
            'BUTTON': '按钮',
            'INPUT': '输入框',
            'SELECT': '下拉选择',
            'SWITCH': '开关',
            'SLIDER': '滑块',
            'DATEPICKER': '日期选择',
            'ROW': '行布局',
            'COL': '列布局',
            'LOGINFORM': '登录表单'
        };
        return nameMap[type] || type;
    };

    return (
        <div style={{
            width: '250px',
            padding: '10px',
            borderRight: '1px solid #eee',
            backgroundColor: '#fafafa',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>组件库</h3>
                <button
                    onClick={() => setShowAIPanel(!showAIPanel)}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: showAIPanel ? '#1890ff' : '#f0f0f0',
                        color: showAIPanel ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    AI生成xxx
                </button>
            </div>

            {showAIPanel && (
                <div style={{
                    position: 'absolute',
                    top: '60px',
                    left: '10px',
                    right: '10px',
                    zIndex: 100,
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <AIGeneratePanel onClose={() => setShowAIPanel(false)} />
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginTop: showAIPanel ? '160px' : '0'
            }}>
                {components.map((comp, index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={(e) => {
                            console.log('开始拖拽组件:', comp.type);
                            // 使用拖拽服务处理拖拽开始
                            dragDropService.startDrag({
                                type: comp.type,
                                props: comp.element.props || {}
                            }, e);
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '10px',
                            border: '1px solid #eee',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            cursor: 'grab'
                        }}>
                        <div style={{ marginBottom: '8px' }}>{comp.element}</div>
                        <span style={{ fontSize: '12px', color: '#666' }}>{comp.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
