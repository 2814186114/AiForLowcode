import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { parseSchema } from '../core/schemaParser/SchemaParser'; // 使用新的Schema解析器
import { getComponent } from '../core/schemaParser/ComponentRegistry'; // 导入组件获取方法
import { useStore } from '../core/store';
import { exportAsReactProject } from '../core/codeGenerator/ReactCodeGenerator'; // 导入模板代码生成器
import { exportAsReactProjectWithBabel } from '../core/codeGenerator/BabelReactCodeGenerator'; // 导入Babel代码生成器
import Row from '../widgets/Row';
import Col from '../widgets/Col';

// 配置Monaco编辑器使用本地CDN或处理加载错误
const monacoConfig = {
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
    }
};

const SchemaEditor = () => {
    const [schemaCode, setSchemaCode] = useState('');
    const [previewComponents, setPreviewComponents] = useState([]);
    const [error, setError] = useState(null);
    const addSchema = useStore(state => state.addSchema);

    // 初始化默认Schema
    useEffect(() => {
        const defaultSchema = JSON.stringify([
            {
                "type": "Row",
                "childrenIds": ["col1", "col2"]
            },
            {
                "id": "col1",
                "type": "Col",
                "props": { "span": 12 },
                "childrenIds": ["input1"]
            },
            {
                "id": "col2",
                "type": "Col",
                "childrenIds": ["button1"]
            },
            {
                "id": "input1",
                "type": "Input",
                "props": { "label": "姓名" }
            },
            {
                "id": "button1",
                "type": "Button",
                "props": { "text": "提交" }
            }
        ], null, 2);

        setSchemaCode(defaultSchema);
        updatePreview(defaultSchema);
    }, []);

    // 更新预览
    const updatePreview = (code) => {
        try {
            // 验证输入是否为有效的JSON字符串
            if (!code || code.trim() === '') {
                setPreviewComponents([]);
                setError(null);
                return;
            }

            // 尝试解析JSON
            const parsed = JSON.parse(code);
            const components = parseSchema(parsed);
            setPreviewComponents(components);
            setError(null);
        } catch (err) {
            setError(`JSON解析错误: ${err.message}`);
            setPreviewComponents([]);
        }
    };

    // 应用Schema到画布
    const applySchema = () => {
        try {
            const success = addSchema(JSON.parse(schemaCode));
            console.log(success, 'xxxxx');

            if (success) {
                setError(null);
                setApplyStatus('success');
                setTimeout(() => setApplyStatus(null), 2000); // 2秒后清除状态
            } else {
                setError('添加组件失败，请检查控制台日志');
            }
        } catch (err) {
            setError(`应用失败: ${err.message}`);
        }
    };

    // 导出为React代码（模板方式）
    const exportAsReact = () => {
        try {
            const schema = JSON.parse(schemaCode);
            exportAsReactProject(schema, 'generated-app-template');
            setError(null);
        } catch (err) {
            setError(`导出失败: ${err.message}`);
        }
    };

    // 导出为React代码（Babel方式）
    const exportAsReactWithBabel = () => {
        try {
            const schema = JSON.parse(schemaCode);
            exportAsReactProjectWithBabel(schema, 'generated-app-babel');
            setError(null);
        } catch (err) {
            setError(`Babel导出失败: ${err.message}`);
        }
    };

    // 预览渲染器组件
    const PreviewRenderer = ({ component }) => {
        try {
            const Component = getComponent(component.type);
            return (
                <Component {...component.props}>
                    {component.children?.map(child => (
                        <PreviewRenderer key={child.id} component={child} />
                    ))}
                </Component>
            );
        } catch (e) {
            return <div className="error">未注册的组件类型: {component.type}</div>;
        }
    };

    const [applyStatus, setApplyStatus] = useState(null); // 'success' | 'error'

    return (
        <div className="schema-editor">
            <Row gutter={16}>
                <Col span={12}>
                    <MonacoEditor
                        height="400px"
                        language="json"
                        theme="vs-light"
                        value={schemaCode}
                        onChange={(value) => {
                            setSchemaCode(value || '');
                            updatePreview(value || '');
                        }}
                        beforeMount={(monaco) => {
                            // 配置Monaco编辑器使用CDN
                            monacoConfig.paths.vs = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs';
                            window.MonacoEnvironment = {
                                getWorkerUrl: function (moduleId, label) {
                                    const baseUrl = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs';
                                    if (label === 'json') {
                                        return `${baseUrl}/language/json/json.worker.js`;
                                    }
                                    if (label === 'css' || label === 'scss' || label === 'less') {
                                        return `${baseUrl}/language/css/css.worker.js`;
                                    }
                                    if (label === 'html' || label === 'handlebars' || label === 'razor') {
                                        return `${baseUrl}/language/html/html.worker.js`;
                                    }
                                    if (label === 'typescript' || label === 'javascript') {
                                        return `${baseUrl}/language/typescript/ts.worker.js`;
                                    }
                                    return `${baseUrl}/editor/editor.worker.js`;
                                }
                            };
                        }}
                        onError={(error) => {
                            console.error('Monaco Editor error:', error);
                            setError(`编辑器加载失败: ${error.message || '请检查网络连接'}`);
                        }}
                        loading={<div>正在加载编辑器...</div>}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            lineNumbers: 'on',
                            tabSize: 2
                        }}
                    />

                    {/* 按钮组 */}
                    <div style={{ marginTop: 10, display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={applySchema}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: applyStatus === 'success' ? '#52c41a' : '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: applyStatus === 'success' ? 'default' : 'pointer',
                                    flex: 1
                                }}
                                disabled={applyStatus === 'success'}
                            >
                                {applyStatus === 'success' ? '✓ 已应用' : '应用到画布'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={exportAsReact}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                模板导出
                            </button>

                            <button
                                onClick={exportAsReactWithBabel}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6f42c1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                Babel导出
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message" style={{ marginTop: 10 }}>{error}</div>}
                    {applyStatus === 'success' && !error && (
                        <div style={{ color: 'green', marginTop: 10 }}>组件已成功添加到画布</div>
                    )}
                </Col>
                <Col span={12}>
                    <div className="preview-panel">
                        <h3>实时预览</h3>
                        <div className="preview-container">
                            {previewComponents.length > 0 ? (
                                previewComponents.map(comp => (
                                    <PreviewRenderer key={comp.id} component={comp} />
                                ))
                            ) : (
                                <div className="empty-preview">编辑Schema生成预览</div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default SchemaEditor;
