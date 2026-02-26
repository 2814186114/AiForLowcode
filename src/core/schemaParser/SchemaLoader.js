/**
 * Schema加载服务 - 加载和解析JSON Schema
 */

import { parseSchema, validateSchema } from './SchemaParser';
import { APIConnector } from '../apiConnector';

/**
 * 从URL加载远程Schema
 * @param {string} url Schema URL
 * @returns {Promise<Object>} 解析后的组件树
 */
export async function loadRemoteSchema(url) {
    try {
        const response = await APIConnector.call('GET', url);
        if (!response.ok) {
            throw new Error(`加载Schema失败: ${response.statusText}`);
        }

        const schema = await response.json();
        return loadSchema(schema);
    } catch (error) {
        console.error('加载远程Schema失败:', error);
        throw error;
    }
}

/**
 * 加载并解析Schema
 * @param {Object|string} schema JSON Schema对象或URL
 * @returns {Array} 解析后的组件树
 */
export function loadSchema(schema) {
    // 如果是字符串，视为URL
    if (typeof schema === 'string') {
        return loadRemoteSchema(schema);
    }

    // 验证Schema格式
    if (!validateSchema(schema)) {
        throw new Error('无效的Schema格式');
    }

    // 解析Schema
    return parseSchema(schema);
}

/**
 * 批量添加Schema到画布
 * @param {Object|string} schema JSON Schema对象或URL
 * @param {Function} addComponent 添加组件的方法
 */
export async function addSchemaToCanvas(schema, addComponent) {
    try {
        const componentTree = await loadSchema(schema);
        console.log('xxxx');

        // 递归添加组件
        const addComponents = (components, parentId = null) => {
            components.forEach(comp => {
                const compId = addComponent(comp, parentId);
                if (comp.children && comp.children.length > 0) {
                    addComponents(comp.children, compId);
                }
            });
        };

        addComponents(componentTree);
        return true;
    } catch (error) {
        console.error('添加Schema到画布失败:', error);
        return false;
    }
}
