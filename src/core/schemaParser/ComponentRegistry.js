/**
 * 组件注册表 - 管理JSON Schema与React组件的映射关系
 */

// 组件注册表
const componentRegistry = new Map();

/**
 * 注册组件类型
 * @param {string} type 组件类型名称
 * @param {React.Component} component React组件
 */
export function registerComponent(type, component) {
    // 统一转换为大写确保大小写一致性
    const normalizedType = type.toUpperCase();
    if (componentRegistry.has(normalizedType)) {
        console.warn(`组件类型 "${normalizedType}" 已注册，将被覆盖`);
    }
    componentRegistry.set(normalizedType, component);
}

/**
 * 获取组件实例
 * @param {string} type 组件类型名称
 * @returns {React.Component} 对应的React组件
 */
export function getComponent(type) {
    // 统一转换为大写确保大小写一致性
    const normalizedType = type.toUpperCase();
    if (!componentRegistry.has(normalizedType)) {
        throw new Error(`未注册的组件类型: ${normalizedType}`);
    }
    return componentRegistry.get(normalizedType);
}

/**
 * 批量注册组件
 * @param {Object} components 组件映射对象 {type: Component}
 */
export function registerComponents(components) {
    Object.entries(components).forEach(([type, component]) => {
        registerComponent(type, component);
    });
}

/**
 * 获取所有已注册的组件类型
 * @returns {string[]} 组件类型数组
 */
export function getAllComponentTypes() {
    // 返回原始注册类型（大写）
    return Array.from(componentRegistry.keys());
}

// 导出注册表实例
export default componentRegistry;
