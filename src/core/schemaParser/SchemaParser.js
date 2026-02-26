/**
 * JSON Schema解析器 - 将JSON Schema转换为组件树
 */

import { getComponent } from './ComponentRegistry';

/**
 * 解析JSON Schema为组件树
 * @param {Object} schema JSON Schema对象
 * @returns {Array} 组件树数组
 */
export function parseSchema(schema) {
    // 支持数组形式的Schema
    if (Array.isArray(schema)) {
        return schema.map(node => parseNode(node));
    }

    if (!schema || typeof schema !== 'object') {
        throw new Error('无效的Schema: 必须是非空对象或数组');
    }

    // 处理根节点
    if (!schema.type) {
        throw new Error('Schema缺少必需的type属性');
    }

    return [parseNode(schema)];
}

/**
 * 递归解析单个节点
 * @param {Object} node 节点对象
 * @param {string} parentId 父组件ID
 * @returns {Object} 组件配置对象
 */
function parseNode(node, parentId = null) {
    // 获取组件类型
    const componentType = node.type;
    if (!componentType) {
        throw new Error('节点缺少type属性');
    }

    // 验证组件是否已注册
    try {
        getComponent(componentType);
    } catch (e) {
        throw new Error(`未注册的组件类型: ${componentType}`);
    }

    // 构造基础组件配置
    const component = {
        type: componentType,
        props: { ...node },
        parentId
    };

    // 移除特殊字段
    delete component.props.type;
    delete component.props.children;

    // 递归处理子节点
    if (node.children && Array.isArray(node.children)) {
        component.childrenIds = [];
        component.children = node.children.map(child => {
            const childComponent = parseNode(child, component.id);
            component.childrenIds.push(childComponent.id);
            return childComponent;
        });
    }

    // 处理amis兼容字段
    if (node.body && Array.isArray(node.body)) {
        component.childrenIds = [];
        component.children = node.body.map(child => {
            const childComponent = parseNode(child, component.id);
            component.childrenIds.push(childComponent.id);
            return childComponent;
        });
    }

    return component;
}

/**
 * 验证Schema结构
 * @param {Object} schema JSON Schema对象
 * @returns {boolean} 是否有效
 */
export function validateSchema(schema) {
    // 支持数组验证
    if (Array.isArray(schema)) {
        return schema.every(node => {
            if (!node || typeof node !== 'object') return false;
            return !!node.type;
        });
    }

    try {
        parseSchema(schema);
        return true;
    } catch (e) {
        console.error('Schema验证失败:', e.message);
        return false;
    }
}
