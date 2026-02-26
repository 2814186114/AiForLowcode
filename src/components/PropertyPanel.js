import React from 'react';
import { useStore } from '../core/store';
import { componentProperties, componentTypeMap } from '../core/propertyConfig';
import PropertyField from './PropertyField';
import DataMapper from './DataMapper'; // 导入数据映射组件
import { APIConnector } from '../core/apiConnector'; // 导入API连接器

export default function PropertyPanel() {
    const selectedComponentId = useStore((state) => state.selectedComponentId);
    const components = useStore((state) => state.getCurrentComponents());
    const updateComponentProps = useStore((state) => state.updateComponentProps);

    // 状态：当前选中的标签页
    const [activeTab, setActiveTab] = React.useState('properties');
    // AI生成相关状态
    const [aiPrompt, setAiPrompt] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [generationError, setGenerationError] = React.useState(null);
    // 生成模式：'configure'配置模式 / 'create'创建模式
    const [generationMode, setGenerationMode] = React.useState('configure');

    // 处理AI生成
    const handleAiGeneration = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // 调用AI生成Schema
            const result = await APIConnector.aiGenerateSchema(aiPrompt);
            const { componentType, props } = result;

            if (generationMode === 'configure') {
                // 配置模式：更新当前组件
                updateComponentProps(selectedComponent.id, props);
                // 切换到属性面板查看结果
                setActiveTab('properties');
            } else {
                // 创建模式：创建新组件
                // 根据组件类型创建新组件
                const newComponent = {
                    type: componentTypeMap[componentType] || componentType,
                    props,
                    position: { x: 50, y: 50 } // 添加默认位置
                };

                // 添加新组件到画布
                useStore.getState().addComponent(newComponent);

                // 显示成功消息
                setGenerationError('组件创建成功！已添加到画布');
            }
        } catch (error) {
            console.error('AI生成失败:', error);
            setGenerationError('生成失败，请重试或调整描述');
        } finally {
            setIsGenerating(false);
        }
    };

    // 获取当前选中的组件
    const selectedComponent = selectedComponentId
        ? components.find(c => c.id === selectedComponentId)
        : null;

    if (!selectedComponent) {
        return (
            <div style={{ padding: '20px', color: '#999', textAlign: 'center' }}>
                请选择画布中的组件进行配置
            </div>
        );
    }

    // 获取当前组件的属性配置
    const properties = componentProperties[selectedComponent.type] || {};

    return (
        <div style={{ padding: '15px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '10px'
            }}>
                <h3 style={{
                    marginTop: 0,
                    marginBottom: 0,
                    color: '#1890ff'
                }}>
                    {selectedComponent.type} 配置
                </h3>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setActiveTab('properties')}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: activeTab === 'properties' ? '#1890ff' : '#f5f5f5',
                            color: activeTab === 'properties' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        属性
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: activeTab === 'data' ? '#1890ff' : '#f5f5f5',
                            color: activeTab === 'data' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        数据
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: activeTab === 'api' ? '#1890ff' : '#f5f5f5',
                            color: activeTab === 'api' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        动作配置
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: activeTab === 'ai' ? '#1890ff' : '#f5f5f5',
                            color: activeTab === 'ai' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        AI生成
                    </button>
                </div>
            </div>

            {activeTab === 'properties' ? (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {Object.keys(properties).length === 0 ? (
                        <p style={{ color: '#666', marginTop: 0 }}>
                            暂无可用配置项
                        </p>
                    ) : (
                        Object.entries(properties).map(([propName, config]) => (
                            <PropertyField
                                key={propName}
                                propName={propName}
                                config={config}
                                value={selectedComponent.props[propName] || config.default}
                                onChange={(value) => updateComponentProps(selectedComponent.id, { [propName]: value })}
                            />
                        ))
                    )}
                </div>
            ) : activeTab === 'data' ? (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ marginTop: 0, color: '#666', marginBottom: '15px' }}>
                        配置组件数据绑定
                    </p>

                    {/* 数据源配置 */}
                    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px' }}>数据源配置</h4>
                        {properties.dataSource && (
                            <PropertyField
                                propName="dataSource"
                                config={properties.dataSource}
                                value={selectedComponent.props.dataSource || properties.dataSource.default}
                                onChange={(value) => updateComponentProps(selectedComponent.id, { dataSource: value })}
                            />
                        )}
                    </div>

                    {/* 保留原有的数据映射组件 */}
                    <DataMapper />
                </div>
            ) : activeTab === 'api' ? (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ marginTop: 0, color: '#666', marginBottom: '15px' }}>
                        {selectedComponent.type === 'Button' ? '配置按钮点击动作' : '配置组件API请求'}
                    </p>

                    {selectedComponent.type === 'Button' ? (
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>动作类型:</label>
                                <select
                                    value={selectedComponent.props.onClickAction?.type || 'none'}
                                    onChange={(e) => updateComponentProps(selectedComponent.id, {
                                        onClickAction: {
                                            ...selectedComponent.props.onClickAction,
                                            type: e.target.value
                                        }
                                    })}
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="none">无动作</option>
                                    <option value="api">API请求</option>
                                </select>
                            </div>

                            {selectedComponent.props.onClickAction?.type === 'api' && (
                                <div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label>API端点:</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.onClickAction?.endpoint || ''}
                                            onChange={(e) => updateComponentProps(selectedComponent.id, {
                                                onClickAction: {
                                                    ...selectedComponent.props.onClickAction,
                                                    endpoint: e.target.value
                                                }
                                            })}
                                            style={{ width: '100%', padding: '8px' }}
                                            placeholder="/api/register"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label>请求方法:</label>
                                        <select
                                            value={selectedComponent.props.onClickAction?.method || 'POST'}
                                            onChange={(e) => updateComponentProps(selectedComponent.id, {
                                                onClickAction: {
                                                    ...selectedComponent.props.onClickAction,
                                                    method: e.target.value
                                                }
                                            })}
                                            style={{ width: '100%', padding: '8px' }}
                                        >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label>URL:</label>
                            <input
                                type="text"
                                value={selectedComponent.props.apiConfig?.url || ''}
                                onChange={(e) => updateComponentProps(selectedComponent.id, {
                                    apiConfig: {
                                        ...selectedComponent.props.apiConfig,
                                        url: e.target.value
                                    }
                                })}
                                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            />
                            <label>请求方法:</label>
                            <select
                                value={selectedComponent.props.apiConfig?.method || 'GET'}
                                onChange={(e) => updateComponentProps(selectedComponent.id, {
                                    apiConfig: {
                                        ...selectedComponent.props.apiConfig,
                                        method: e.target.value
                                    }
                                })}
                                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ marginTop: 0, color: '#666', marginBottom: '15px' }}>
                        通过自然语言描述生成组件配置
                    </p>

                    {/* 模式选择器 */}
                    <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="generationMode"
                                checked={generationMode === 'configure'}
                                onChange={() => setGenerationMode('configure')}
                                disabled={isGenerating}
                                style={{ marginRight: '5px' }}
                            />
                            配置模式（更新当前组件）
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="generationMode"
                                checked={generationMode === 'create'}
                                onChange={() => setGenerationMode('create')}
                                disabled={isGenerating}
                                style={{ marginRight: '5px' }}
                            />
                            创建模式（生成新组件）
                        </label>
                    </div>

                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #d9d9d9',
                            marginBottom: '10px'
                        }}
                        placeholder="例如：创建一个包含姓名、邮箱和提交按钮的表单"
                        disabled={isGenerating}
                    />
                    {generationError && (
                        <p style={{ color: '#ff4d4f', marginTop: 0, marginBottom: '10px' }}>
                            {generationError}
                        </p>
                    )}
                    <button
                        onClick={handleAiGeneration}
                        disabled={isGenerating || !aiPrompt.trim()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isGenerating || !aiPrompt.trim() ? '#bfbfbf' : '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isGenerating ? '生成中...' : '生成配置'}
                    </button>
                </div>
            )}
        </div>
    );
}
