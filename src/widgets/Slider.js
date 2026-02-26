import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../core/store';

export default function Slider({ min = 0, max = 100, defaultValue = 50, onChange = () => { } }) {
    const mode = useStore((state) => state.mode);
    const [value, setValue] = useState(defaultValue);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Slider',
            defaultProps: {
                min,
                max,
                defaultValue,
                onChange
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const handleChange = (e) => {
        const newValue = parseInt(e.target.value);
        setValue(newValue);
        onChange(newValue);
    };

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: mode === 'design' ? 'move' : 'auto',
                width: '200px',
                padding: '10px 0'
            }}
        >
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
                style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#d9d9d9',
                    outline: 'none',
                    opacity: mode === 'design' ? 0.6 : 1
                }}
                disabled={mode === 'design'}
            />
            {mode === 'preview' && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '5px',
                    fontSize: '14px'
                }}>
                    {value}
                </div>
            )}
        </div>
    );
}
