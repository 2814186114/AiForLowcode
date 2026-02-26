import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from '../core/store';

export default React.memo(function Col({
    id,
    children,
    span = 24,
    offset = 0,
    height = 'auto',
    gutter,
    width
}) {
    const mode = useStore((state) => state.mode);
    const updateComponentProp = useStore((state) => state.updateComponentProp);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget',
        item: {
            type: 'Col',
            props: {
                span,
                offset,
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
                    console.error('Invalid col id');
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

    // 动态样式绑定 - 响应式更新
    const colStyle = React.useMemo(() => ({
        flex: `0 0 ${span * (100 / 24)}%`,
        maxWidth: `${span * (100 / 24)}%`,
        padding: `0 ${gutter / 2}px`,
        width: width,  // 使用传入的width属性
        height: height, // 使用传入的height属性
        minHeight: '50px',
        boxSizing: 'border-box',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#f6ffed' : '#f9f9f9',
        border: isOver ? '3px solid #52c41a' : '1px dashed #ccc',
        position: 'relative',
        zIndex: isOver ? 20 : 10
    }), [width, height, span, isDragging, isOver, gutter]);

    return (
        <div
            ref={setRef}
            data-component-id={id}
            data-component-type="Col"
            data-drop-zone="true"
            style={colStyle}
        >
            {children}
        </div>
    );
});
