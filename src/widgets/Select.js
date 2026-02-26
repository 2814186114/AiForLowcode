import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../core/store';

export default function Select({ options = ['选项1', '选项2', '选项3'], defaultValue = '' }) {
    const mode = useStore((state) => state.mode);
    const [value, setValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Select',
            defaultProps: {
                options,
                defaultValue
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: mode === 'design' ? 'move' : 'pointer',
                position: 'relative',
                width: '200px'
            }}
        >
            <select
                value={value}
                onChange={handleChange}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    appearance: 'none'
                }}
                disabled={mode === 'design'}
                onFocus={() => mode === 'preview' && setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
            >
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {mode === 'preview' && (
                <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                }}>
                    {isOpen ? '▲' : '▼'}
                </div>
            )}
        </div>
    );
}
