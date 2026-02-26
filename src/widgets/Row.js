import React from 'react';
import { Resizable } from 'react-resizable';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from '../core/store';

export default React.memo(function Row({
    id,
    children,
    gutter = 16,
    justify = 'start',
    align = 'top',
    width = '100%',
    height = 'auto',
    onResize
}) {
    const mode = useStore((state) => state.mode);
    const updateComponentProp = useStore((state) => state.updateComponentProp);

    // 映射justify值到CSS属性
    const justifyMap = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        'space-around': 'space-around',
        'space-between': 'space-between'
    };

    // 映射align值到CSS属性
    const alignMap = {
        top: 'flex-start',
        middle: 'center',
        bottom: 'flex-end'
    };

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Row',
            props: {
                gutter,
                justify,
                align,
                width,
                height
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'widget',
        drop: (item, monitor) => {
            // 阻止事件冒泡确保内层容器优先
            if (monitor.isOver({ shallow: true })) {
                if (!id) {
                    console.error('Invalid row id');
                    return;
                }

                const dropResult = {
                    parentId: id,
                    dropHandled: true
                };
                return dropResult;
            }
            return undefined; // 阻止外层容器处理
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
            itemType: monitor.getItemType()
        })
    }));

    const setRef = (node) => {
        drag(node);
        drop(node);
    };

    const handleResize = (event, { size }) => {
        if (id) {
            updateComponentProp(id, 'height', size.height);
            if (onResize) onResize(size);
        }
    };

    // 动态样式绑定 - 响应式更新
    const rowStyle = React.useMemo(() => ({
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gutter}px`,
        justifyContent: justifyMap[justify] || justify,
        alignItems: alignMap[align] || align,
        padding: '10px',
        minHeight: '50px',
        width: width,  // 使用传入的width属性
        height: height, // 使用传入的height属性
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#f6ffed' : '#f9f9f9',
        border: isOver ? '3px solid #52c41a' : '1px dashed #ccc',
        position: 'relative',
        zIndex: isOver ? 20 : 10
    }), [width, height, gutter, justify, align, isDragging, isOver]);

    return (
        <Resizable
            height={typeof height === 'string' ? parseInt(height, 10) || 0 : height}
            width={typeof width === 'string' ? parseInt(width, 10) || 0 : width}
            onResize={handleResize}
            resizeHandles={['s']} // 只允许从底部调整高度
        >
            <div
                ref={setRef}
                data-component-id={id}
                data-component-type="Row"
                data-drop-zone="true"
                style={rowStyle}
            >
                {children}
            </div>
        </Resizable>
    );
});
