import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateSchema } from '../core/ai/aiClient';
import { useStore } from '../core/store';
import { componentTypeMap } from '../core/propertyConfig';

// 递归生成组件树
const generateComponentTree = (schema, position = { x: 50, y: 50 }, depth = 0) => {
    if (!schema || !schema.componentType) return null;

    const component = {
        type: componentTypeMap[schema.componentType] || schema.componentType,
        props: schema.props || {},
        position: { ...position, y: position.y + depth * 100 }
    };

    // 处理子组件
    if (schema.props && schema.props.children && Array.isArray(schema.props.children)) {
        component.children = schema.props.children.map((childSchema, index) =>
            generateComponentTree(childSchema, { x: position.x + 120, y: position.y + index * 80 }, depth + 1)
        ).filter(Boolean);
    }

    return component;
};

export default function AIGeneratePanel({ onClose }) {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState(null);
    const [generationMode, setGenerationMode] = useState('create');

    const { aiSession, initAISession, updateAIContext } = useStore();

    // 初始化会话ID
    useEffect(() => {
        initAISession();
    }, [initAISession]);

    const handleAiGeneration = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        setGenerationStatus(null);

        try {
            console.log('AI生成请求:', aiPrompt);
            // 获取当前会话的上下文历史
            const contextHistory = aiSession.context || [];
            const schema = await generateSchema(aiPrompt, aiSession.id, contextHistory);
            console.log('AI生成Schema:', schema);

            if (!schema || !schema.componentType) {
                throw new Error('AI返回无效组件类型');
            }

            // 更新AI上下文
            updateAIContext(aiPrompt, schema);

            if (generationMode === 'create') {
                const rootComponent = generateComponentTree(schema);
                if (!rootComponent) {
                    throw new Error('无法解析组件树');
                }

                // 添加根组件到画布
                useStore.getState().addComponent(rootComponent);

                // 递归添加子组件
                const addChildren = (component) => {
                    if (component.children) {
                        component.children.forEach(child => {
                            useStore.getState().addComponent(child);
                            addChildren(child);
                        });
                    }
                };
                addChildren(rootComponent);

                setGenerationStatus({
                    type: 'success',
                    message: '组件创建成功！已添加到画布'
                });

                // 自动关闭面板
                setTimeout(() => {
                    onClose();
                    setGenerationStatus(null);
                }, 2000);
            } else {
                // 配置模式逻辑（待实现）
                setGenerationStatus({
                    type: 'info',
                    message: '配置模式需在属性面板中使用'
                });
            }
        } catch (error) {
            console.error('AI生成失败:', error);
            setGenerationStatus({
                type: 'error',
                message: `生成失败: ${error.message || '请重试或调整描述'}`
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ marginTop: 0 }}>AI生成组件</h4>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                    ✕
                </button>
            </div>

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        name="generationMode"
                        checked={generationMode === 'create'}
                        onChange={() => setGenerationMode('create')}
                        disabled={isGenerating}
                        style={{ marginRight: '5px' }}
                    />
                    创建模式
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        name="generationMode"
                        checked={generationMode === 'configure'}
                        onChange={() => setGenerationMode('configure')}
                        disabled={isGenerating}
                        style={{ marginRight: '5px' }}
                    />
                    配置模式
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
                    marginBottom: '10px',
                    fontFamily: 'inherit'
                }}
                placeholder="例如：创建一个蓝色按钮，文字为'提交'"
                disabled={isGenerating}
            />

            {generationStatus && (
                <p style={{
                    color: generationStatus.type === 'success' ? '#52c41a' :
                        generationStatus.type === 'error' ? '#ff4d4f' : '#1890ff',
                    marginTop: 0,
                    marginBottom: '10px',
                    fontSize: '14px'
                }}>
                    {generationStatus.message}
                </p>
            )}

            <button
                onClick={handleAiGeneration}
                disabled={isGenerating || !aiPrompt.trim()}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: isGenerating || !aiPrompt.trim() ? '#bfbfbf' : '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                }}
            >
                {isGenerating ? '生成中...' : '生成组件'}
            </button>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                提示：在画布空白处点击可取消选择任何组件
            </div>
        </div>
    );
}
