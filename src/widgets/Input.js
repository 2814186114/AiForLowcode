import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../core/store';

export default function Input({ id, props: componentProps = {} }) {
    // 从props中解构属性，提供默认值
    const { label = '输入框', placeholder = '请输入', value: initialValue = '', onChange = () => { } } = componentProps;
    const mode = useStore((state) => state.mode);
    const [inputProps, setInputProps] = useState({ label, placeholder, value: initialValue, onChange });
    const [inputValue, setInputValue] = useState(initialValue);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Input',
            defaultProps: inputProps
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    // 监听属性变更
    useEffect(() => {
        if (!id) return;
        const unsubscribe = useStore.subscribe((state) => {
            const currentPage = state.getCurrentPage();
            if (!currentPage) return;

            const component = currentPage.components.find(c => c.id === id);
            if (component) {
                setInputProps(component.props);
                setInputValue(component.props.value || '');
            }
        });
        return () => unsubscribe();
    }, [id]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        inputProps.onChange(newValue);
    };

    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {inputProps.label && <label>{inputProps.label}</label>}
            <input
                type="text"
                placeholder={inputProps.placeholder}
                value={inputValue}
                onChange={mode === 'preview' ? handleChange : undefined}
                disabled={mode === 'design'}
                style={{
                    padding: '8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
}
