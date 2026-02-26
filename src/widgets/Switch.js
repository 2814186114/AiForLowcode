import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../core/store';

export default function Switch({ checked = false, onChange = () => { } }) {
    const mode = useStore((state) => state.mode);
    const [isChecked, setIsChecked] = useState(checked);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Switch',
            defaultProps: {
                checked,
                onChange
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const handleToggle = () => {
        if (mode === 'preview') {
            const newValue = !isChecked;
            setIsChecked(newValue);
            onChange(newValue);
        }
    };

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: mode === 'design' ? 'move' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
            }}
            onClick={handleToggle}
        >
            <div style={{
                width: '40px',
                height: '20px',
                borderRadius: '10px',
                backgroundColor: isChecked ? '#1890ff' : '#bfbfbf',
                position: 'relative',
                transition: 'background-color 0.3s'
            }}>
                <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: isChecked ? '22px' : '2px',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
            </div>
            <span style={{ marginLeft: '8px' }}>
                {isChecked ? '开' : '关'}
            </span>
        </div>
    );
}
