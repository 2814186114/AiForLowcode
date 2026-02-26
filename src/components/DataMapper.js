import React from 'react';
import { useStore } from '../core/store';
import { APIConnector } from '../core/apiConnector'; // 导入API连接器

// 解析嵌套路径的工具函数
function resolvePath(obj, path) {
    return path.split('.').reduce((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return acc[key];
        }
        return undefined;
    }, obj);
}

/**
 * 数据映射编辑器组件
 * 用于配置组件属性与API数据的映射关系
 */
export default function DataMapper() {
    const apiData = useStore(state => state.apiData);
    const loading = useStore(state => state.loading);
    const error = useStore(state => state.error);
    const fetchData = useStore(state => state.fetchData);

    // 当前选中的API和数据映射
    const [selectedApi, setSelectedApi] = React.useState('');
    const [mappings, setMappings] = React.useState([]);

    // 可用API列表（从API连接器配置获取）
    const apiList = Object.keys(APIConnector.config);

    // 获取选中的组件ID和更新组件属性的方法
    const selectedComponentId = useStore(state => state.selectedComponentId);
    const updateComponentProp = useStore(state => state.updateComponentProp);

    // 加载API数据并应用映射
    const handleLoadData = () => {
        if (selectedApi) {
            fetchData(selectedApi).then(() => {
                // 数据加载完成后应用所有映射
                applyMappings();
            });
        }
    };

    // 应用数据映射到组件
    const applyMappings = () => {
        if (!selectedComponentId) {
            console.warn('没有选中组件，无法应用映射');
            return;
        }

        mappings.forEach(mapping => {
            if (!mapping.sourceField || !mapping.targetProp) return;

            try {
                // 解析数据路径
                const dataValue = resolvePath(apiData[selectedApi], mapping.sourceField);

                // 应用转换函数（如果存在）
                const finalValue = mapping.transform
                    ? (new Function('value', `return (${mapping.transform})(value)`))(dataValue)
                    : dataValue;

                // 更新组件属性
                updateComponentProp(selectedComponentId, mapping.targetProp, finalValue);

                console.log(`应用映射: ${mapping.sourceField} -> ${mapping.targetProp} = ${finalValue}`);
            } catch (error) {
                console.error('应用映射时出错:', error);
            }
        });
    };

    // 当映射变化时自动应用
    React.useEffect(() => {
        if (mappings.length > 0 && apiData[selectedApi]) {
            applyMappings();
        }
    }, [mappings, apiData[selectedApi]]);

    // 添加新映射
    const addMapping = () => {
        setMappings([...mappings, {
            id: Date.now(),
            sourceField: '',
            targetProp: '',
            transform: ''
        }]);
    };

    // 更新映射
    const updateMapping = (id, field, value) => {
        setMappings(mappings.map(mapping =>
            mapping.id === id ? { ...mapping, [field]: value } : mapping
        ));
    };

    // 删除映射
    const removeMapping = (id) => {
        setMappings(mappings.filter(mapping => mapping.id !== id));
    };

    return (
        <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>数据映射配置</h3>

            {/* API选择器 */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    选择数据源:
                </label>
                <select
                    value={selectedApi}
                    onChange={(e) => setSelectedApi(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">-- 选择API --</option>
                    {apiList.map(api => (
                        <option key={api} value={api}>{api}</option>
                    ))}
                </select>

                <button
                    onClick={handleLoadData}
                    disabled={!selectedApi || loading[selectedApi]}
                    style={{
                        marginTop: '10px',
                        padding: '8px 15px',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading[selectedApi] ? '加载中...' : '加载数据'}
                </button>

                {error[selectedApi] && (
                    <div style={{ color: 'red', marginTop: '10px' }}>
                        错误: {error[selectedApi]}
                    </div>
                )}
            </div>

            {/* 数据映射配置 */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                }}>
                    <h4 style={{ margin: 0 }}>字段映射</h4>
                    <button
                        onClick={addMapping}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#52c41a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        添加映射
                    </button>
                </div>

                {mappings.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center' }}>
                        暂无字段映射配置
                    </p>
                ) : (
                    <div>
                        {mappings.map((mapping) => (
                            <div key={mapping.id} style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #eee',
                                borderRadius: '4px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        数据字段
                                    </label>
                                    <input
                                        type="text"
                                        value={mapping.sourceField}
                                        onChange={(e) => updateMapping(mapping.id, 'sourceField', e.target.value)}
                                        onBlur={() => applyMappings()} // 失焦时应用映射
                                        placeholder="例如: 0.name"
                                        style={{ width: '100%', padding: '5px' }}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        组件属性
                                    </label>
                                    <input
                                        type="text"
                                        value={mapping.targetProp}
                                        onChange={(e) => updateMapping(mapping.id, 'targetProp', e.target.value)}
                                        onBlur={() => applyMappings()} // 失焦时应用映射
                                        placeholder="例如: value"
                                        style={{ width: '100%', padding: '5px' }}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        转换函数
                                    </label>
                                    <input
                                        type="text"
                                        value={mapping.transform}
                                        onChange={(e) => updateMapping(mapping.id, 'transform', e.target.value)}
                                        onBlur={() => applyMappings()} // 失焦时应用映射
                                        placeholder="例如: value => value.toUpperCase()"
                                        style={{ width: '100%', padding: '5px' }}
                                    />
                                </div>

                                <button
                                    onClick={() => removeMapping(mapping.id)}
                                    style={{
                                        alignSelf: 'flex-end',
                                        padding: '5px 10px',
                                        backgroundColor: '#ff4d4f',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    删除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 预览区域 */}
            {selectedApi && apiData[selectedApi] && (
                <div style={{ marginTop: '20px' }}>
                    <h4>数据预览</h4>
                    <pre style={{
                        backgroundColor: '#f6f8fa',
                        padding: '10px',
                        borderRadius: '4px',
                        maxHeight: '200px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(apiData[selectedApi], null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
