import React, { useState, useEffect } from 'react';

// 表单控件映射
const inputMap = {
    text: ({ value, onChange, hasError }) => (
        <div>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '5px',
                    borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                }}
            />
        </div>
    ),
    number: ({ value, onChange, hasError }) => (
        <div>
            <input
                type="number"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{
                    width: '100%',
                    padding: '5px',
                    borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                }}
            />
        </div>
    ),
    switch: ({ value, onChange }) => (
        <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
                type="checkbox"
                checked={value}
                onChange={e => onChange(e.target.checked)}
                style={{ marginRight: '5px' }}
            />
            {value ? '开启' : '关闭'}
        </label>
    ),
    select: ({ config, value, onChange, hasError }) => (
        <div>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '5px',
                    borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                }}
            >
                {config.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    ),
    radio: ({ config, value, onChange }) => (
        <div style={{ display: 'flex', gap: '10px' }}>
            {config.options.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="radio"
                        checked={value === opt}
                        onChange={() => onChange(opt)}
                        style={{ marginRight: '5px' }}
                    />
                    {opt}
                </label>
            ))}
        </div>
    ),
    json: ({ value, onChange, hasError }) => {
        const formatJSON = () => {
            try {
                const parsed = JSON.parse(value);
                onChange(JSON.stringify(parsed, null, 2));
            } catch (e) {
                // 保留原始值如果格式错误
            }
        };

        return (
            <div>
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onBlur={formatJSON}
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '5px',
                        fontFamily: 'monospace',
                        borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                    }}
                />
                <div style={{ marginTop: '5px', textAlign: 'right' }}>
                    <button
                        onClick={formatJSON}
                        style={{
                            padding: '2px 8px',
                            fontSize: '12px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #d9d9d9',
                            borderRadius: '2px',
                            cursor: 'pointer'
                        }}
                    >
                        格式化
                    </button>
                </div>
            </div>
        );
    },
    color: ({ value, onChange, hasError }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '40px',
                    height: '30px',
                    padding: '0',
                    border: 'none',
                    backgroundColor: 'transparent'
                }}
            />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '5px',
                    marginLeft: '10px',
                    borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                }}
            />
        </div>
    ),
    size: ({ config, value, onChange, hasError }) => (
        <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>宽度</label>
                <input
                    type="text"
                    value={value?.width || '100%'}
                    onChange={e => onChange({ ...value, width: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '5px',
                        borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>高度</label>
                <input
                    type="text"
                    value={value?.height || 'auto'}
                    onChange={e => onChange({ ...value, height: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '5px',
                        borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                    }}
                />
            </div>
        </div>
    ),
    date: ({ value, onChange, hasError }) => (
        <div>
            <input
                type="date"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '5px',
                    borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                }}
            />
        </div>
    ),
    datetime: ({ value, onChange, hasError }) => (
        <div>
            <input
                type="datetime-local"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '5px',
                    borderColor: hasError ? '#ff4d4f' : '#d9d9d9'
                }}
            />
        </div>
    )
};

export default function PropertyField({ propName, config, value, onChange }) {
    const InputComponent = inputMap[config.type];
    const [error, setError] = useState(null);

    // 校验函数
    const validate = (val) => {
        if (!config.validate) return true;

        try {
            const result = config.validate(val, { [propName]: val });
            if (result === true) {
                setError(null);
                return true;
            } else {
                setError(result);
                return false;
            }
        } catch (e) {
            setError('校验失败: ' + e.message);
            return false;
        }
    };

    // 初始化时校验
    useEffect(() => {
        validate(value);
    }, []);

    const handleChange = (newValue) => {
        // 先更新值，然后校验
        onChange(newValue);
        validate(newValue);
    };

    return (
        <div style={{ marginBottom: '15px' }}>
            <div style={{
                marginBottom: '5px',
                fontWeight: '500',
                color: '#333'
            }}>
                {config.label}
                {config.validate && (
                    <span style={{ color: '#ff4d4f', marginLeft: '5px' }}>*</span>
                )}
            </div>

            {InputComponent ? (
                <InputComponent
                    config={config}
                    value={value}
                    onChange={handleChange}
                    hasError={!!error}
                />
            ) : (
                <div style={{ color: '#ff4d4f' }}>
                    不支持的属性类型: {config.type}
                </div>
            )}

            {error && (
                <div style={{
                    color: '#ff4d4f',
                    fontSize: '12px',
                    marginTop: '5px'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
