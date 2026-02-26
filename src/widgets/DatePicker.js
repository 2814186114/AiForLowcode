import React from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../core/store';

export default function DatePicker({
    placeholder = '请选择日期',
    format = 'YYYY-MM-DD',
    showTime = false,
    value = '',
    onChange = () => { }
}) {
    const mode = useStore((state) => state.mode);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'DatePicker',
            props: {
                placeholder,
                format,
                showTime,
                value
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const handleChange = (e) => {
        if (mode === 'preview') {
            onChange(e.target.value);
        }
    };

    const inputType = showTime ? 'datetime-local' : 'date';

    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                disabled={mode === 'design'}
                style={{
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    width: '100%',
                    cursor: mode === 'design' ? 'move' : 'auto'
                }}
            />
        </div>
    );
}
