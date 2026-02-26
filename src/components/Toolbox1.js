import React, { useState } from 'react';
import Button from '../widgets/Button';
import Input from '../widgets/Input';
import Select from '../widgets/Select';
import Switch from '../widgets/Switch';
import Slider from '../widgets/Slider';
import DatePicker from '../widgets/DatePicker';
import Row from '../widgets/Row';
import Col from '../widgets/Col';
import AIGeneratePanel from './AIGeneratePanel';
import { dragDropService } from '../core/dragDropService'; // 引入拖拽服务

export default function Toolbox() {
    const [showAIPanel, setShowAIPanel] = useState(false);
    const components = [
        { type: 'Button', name: '按钮', element: <Button /> },
        { type: 'Input', name: '输入框', element: <Input /> },
        { type: 'Select', name: '下拉选择', element: <Select /> },
        { type: 'Switch', name: '开关', element: <Switch /> },
        { type: 'Slider', name: '滑块', element: <Slider /> },
        { type: 'DatePicker', name: '日期选择', element: <DatePicker /> },
        { type: 'Row', name: '行布局', element: <Row /> },
        { type: 'Col', name: '列布局', element: <Col /> }
    ];

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
