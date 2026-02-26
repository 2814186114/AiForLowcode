/**
 * React代码生成器 - 将JSON Schema转换为纯React源代码
 * 不修改现有代码，独立实现代码生成功能
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * 生成React组件代码
 * @param {Object} schema JSON Schema对象
 * @returns {string} 生成的React代码字符串
 */
export function generateReactCode(schema) {
    try {
        // 解析Schema生成组件树
        const componentTree = parseSchemaToComponentTree(schema);

        // 生成完整的React应用代码
        const code = generateAppCode(componentTree);

        return code;
    } catch (error) {
        console.error('生成React代码失败:', error);
        throw new Error(`代码生成失败: ${error.message}`);
    }
}

/**
 * 将Schema解析为组件树结构
 * @param {Object} schema JSON Schema对象
 * @returns {Array} 组件树数组
 */
function parseSchemaToComponentTree(schema) {
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
 * 解析单个节点
 * @param {Object} node 节点对象
 * @param {string} parentId 父组件ID
 * @returns {Object} 组件配置对象
 */
function parseNode(node, parentId = null) {
    const componentType = node.type;
    if (!componentType) {
        throw new Error('节点缺少type属性');
    }

    // 构造组件配置
    const component = {
        id: uuidv4(),
        type: componentType,
        props: { ...node },
        parentId,
        children: []
    };

    // 移除特殊字段
    delete component.props.type;
    delete component.props.children;

    // 递归处理子节点
    if (node.children && Array.isArray(node.children)) {
        component.children = node.children.map(child =>
            parseNode(child, component.id)
        );
    }

    // 处理amis兼容字段
    if (node.body && Array.isArray(node.body)) {
        component.children = node.body.map(child =>
            parseNode(child, component.id)
        );
    }

    return component;
}

/**
 * 生成完整的React应用代码
 * @param {Array} componentTree 组件树
 * @returns {string} 完整的React代码
 */
function generateAppCode(componentTree) {
    const imports = generateImports(componentTree);
    const components = generateComponentsCode(componentTree);
    const appComponent = generateAppComponent(componentTree);

    return `${imports}

${components}

${appComponent}
`;
}

/**
 * 生成import语句
 * @param {Array} componentTree 组件树
 * @returns {string} import代码
 */
function generateImports(componentTree) {
    const componentTypes = new Set();

    // 收集所有组件类型
    function collectTypes(components) {
        components.forEach(comp => {
            componentTypes.add(comp.type);
            if (comp.children && comp.children.length > 0) {
                collectTypes(comp.children);
            }
        });
    }

    collectTypes(componentTree);

    // 生成import语句
    let imports = `import React from 'react';\n`;

    // 这里可以根据需要添加其他imports
    // 例如: import './App.css';

    return imports;
}

/**
 * 生成所有组件的代码
 * @param {Array} componentTree 组件树
 * @returns {string} 组件代码
 */
function generateComponentsCode(componentTree) {
    const componentTypes = new Set();

    // 收集所有唯一的组件类型
    function collectTypes(components) {
        components.forEach(comp => {
            componentTypes.add(comp.type);
            if (comp.children && comp.children.length > 0) {
                collectTypes(comp.children);
            }
        });
    }

    collectTypes(componentTree);

    let code = '';

    // 为每种类型生成一个组件
    componentTypes.forEach(type => {
        code += `
function ${type}({ children, ...props }) {
    return (
        <div className="${type.toLowerCase()}">
            {${generateJSXContentForType(type, 'props')}}
            {children}
        </div>
    );
}
`;
    });

    return code;
}

/**
 * 生成属性字符串
 * @param {Object} props 属性对象
 * @returns {string} 属性字符串
 */
function generatePropsString(props) {
    return Object.entries(props)
        .map(([key, value]) => {
            if (typeof value === 'string') {
                return `${key}="${value}"`;
            } else {
                return `${key}={${JSON.stringify(value)}}`;
            }
        })
        .join(' ');
}

/**
 * 根据组件类型生成JSX内容
 * @param {string} type 组件类型
 * @param {string} propsVariable 属性变量名
 * @returns {string} JSX代码
 */
function generateJSXContentForType(type, propsVariable) {
    switch (type) {
        case 'Button':
            return `<button {...${propsVariable}}>{${propsVariable}.label || 'Button'}</button>`;
        case 'Input':
            return `<input {...${propsVariable}} placeholder={${propsVariable}.placeholder || ''} />`;
        case 'Form':
            return `<form>{children}</form>`;
        case 'Row':
            return `<div className="row">{children}</div>`;
        case 'Col':
            return `<div className="col">{children}</div>`;
        default:
            return `<div>{/* ${type} component */}{children}</div>`;
    }
}

/**
 * 生成节点渲染代码
 * @param {Object} node 节点对象
 * @returns {string} JSX代码
 */
function generateNodeJSX(node) {
    const propsString = generatePropsString(node.props);
    let childrenJSX = '';

    if (node.children && node.children.length > 0) {
        childrenJSX = node.children.map(child => generateNodeJSX(child)).join('\n');
    }

    if (childrenJSX) {
        return `<${node.type} ${propsString}>\n${childrenJSX}\n</${node.type}>`;
    } else {
        return `<${node.type} ${propsString} />`;
    }
}

/**
 * 生成App组件
 * @param {Array} componentTree 组件树
 * @returns {string} App组件代码
 */
function generateAppComponent(componentTree) {
    const rootJSX = componentTree.map(node => generateNodeJSX(node)).join('\n        ');

    return `
function App() {
    return (
        <div className="app">
            ${rootJSX}
        </div>
    );
}

export default App;
`;
}

/**
 * 导出配置为可下载的文件
 * @param {Object} schema JSON Schema对象
 * @param {string} fileName 文件名
 */
export function exportAsReactProject(schema, fileName = 'react-app') {
    const code = generateReactCode(schema);

    // 创建下载链接
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
