import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../core/store';
import { APIConnector } from '../core/apiConnector';

export default function Button({ id, props: componentProps = {} }) {
    // 从props中解构属性，提供默认值
    const { label = '按钮', type = 'default', color, bgColor, onClick = () => console.log('按钮点击'), apiConfig = null } = componentProps;
    const mode = useStore((state) => state.mode);
    const [buttonProps, setButtonProps] = useState({ label, type, color, bgColor, onClick, apiConfig });
    const [isClicked, setIsClicked] = useState(false);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Button',
            defaultProps: buttonProps
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
                setButtonProps(component.props);
            }
        });

        return () => unsubscribe();
    }, [id]);

    const handleClick = async (e) => {
        setIsClicked(true);

        // 执行API请求（如果配置）
        if (buttonProps.apiConfig && mode === 'preview') {
            try {
                console.log('发起API请求:', buttonProps.apiConfig);
                const response = await APIConnector.call(buttonProps.apiConfig);
                console.log('API响应:', response);
            } catch (error) {
                console.error('API请求失败:', error);
            }
        }

        // 安全调用onClick
        if (typeof buttonProps.onClick === 'function') {
            buttonProps.onClick(e);
        } else {
            console.warn('buttonProps.onClick is not a function');
        }

        // 重置点击状态
        setTimeout(() => setIsClicked(false), 300);
    };

    const getStyle = (type) => {
        const baseStyles = {
            default: {
                backgroundColor: buttonProps.bgColor || '#e0e0e0',
                color: buttonProps.color || '#333'
            },
            primary: {
                backgroundColor: buttonProps.bgColor || '#1890ff',
                color: buttonProps.color || '#fff'
            },
            danger: {
                backgroundColor: buttonProps.bgColor || '#ff4d4f',
                color: buttonProps.color || '#fff'
            }
        };

        const clickedStyles = {
            default: {
                backgroundColor: buttonProps.bgColor ? darkenColor(buttonProps.bgColor, 20) : '#b0b0b0',
                transform: 'scale(0.98)'
            },
            primary: {
                backgroundColor: buttonProps.bgColor ? darkenColor(buttonProps.bgColor, 20) : '#0c6bc5',
                transform: 'scale(0.98)'
            },
            danger: {
                backgroundColor: buttonProps.bgColor ? darkenColor(buttonProps.bgColor, 20) : '#d9363e',
                transform: 'scale(0.98)'
            }
        };

        const style = isClicked ? clickedStyles[type] : baseStyles[type];

        return {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: mode === 'design' ? 'move' : 'pointer',
            opacity: isDragging ? 0.1 : 1,
            transition: 'all 0.2s ease',
            ...style
        };
    };

    // 辅助函数：加深颜色
    const darkenColor = (hex, percent) => {
        // 移除#号
        hex = hex.replace(/^#/, '');

        // 解析RGB值
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // 计算加深后的RGB值
        const darkenedR = Math.max(0, Math.floor(r * (1 - percent / 100)));
        const darkenedG = Math.max(0, Math.floor(g * (1 - percent / 100)));
        const darkenedB = Math.max(0, Math.floor(b * (1 - percent / 100)));

        // 转换为十六进制
        return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
    };

    return (
        <button
            ref={drag}
            style={getStyle(buttonProps.type)}
            onClick={mode === 'preview' ? handleClick : undefined}
            disabled={mode === 'design'}
        >
            {buttonProps.label}
        </button>
    );
}
