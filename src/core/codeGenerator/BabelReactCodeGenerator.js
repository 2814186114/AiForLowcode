/**
 * Babel React代码生成器 - 使用字符串模板生成高质量的React源代码
 * 浏览器环境兼容版本，避免使用Node.js特有的Babel API
 */

/**
 * Babel React代码生成器类
 */
class BabelReactCodeGenerator {
    constructor() {
        this.imports = new Set();
        this.componentTypes = new Set();
        this.usedComponents = new Set();
    }

    /**
     * 生成React组件代码
     * @param {Object} schema JSON Schema对象
     * @returns {string} 生成的React代码字符串
     */
    generateReactCode(schema) {
        try {
            // 解析Schema生成组件树
            const componentTree = this.parseSchemaToComponentTree(schema);

            // 生成React代码
            const code = this.generateCodeFromComponentTree(componentTree);

            return code;
        } catch (error) {
            console.error('React代码生成失败:', error);
            throw new Error(`React代码生成失败: ${error.message}`);
        }
    }

    /**
     * 将Schema解析为组件树结构
     * @param {Object} schema JSON Schema对象
     * @returns {Array} 组件树数组
     */
    parseSchemaToComponentTree(schema) {
        // 支持数组形式的Schema（扁平结构）
        if (Array.isArray(schema)) {
            return this.buildNestedTreeFromFlatSchema(schema);
        }

        if (!schema || typeof schema !== 'object') {
            throw new Error('无效的Schema: 必须是非空对象或数组');
        }

        // 处理根节点
        if (!schema.type) {
            throw new Error('Schema缺少必需的type属性');
        }

        return [this.parseNode(schema)];
    }

    /**
     * 从扁平Schema构建嵌套树结构
     * @param {Array} flatSchema 扁平Schema数组
     * @returns {Array} 嵌套组件树
     */
    buildNestedTreeFromFlatSchema(flatSchema) {
        // 创建节点映射
        const nodeMap = new Map();
        flatSchema.forEach(node => {
            if (node.id) {
                nodeMap.set(node.id, { ...node });
            }
        });

        // 构建嵌套结构
        const buildNestedNode = (node) => {
            const nestedNode = {
                type: node.type,
                props: { ...node }
            };

            // 移除特殊字段
            delete nestedNode.props.type;
            delete nestedNode.props.children;
            delete nestedNode.props.childrenIds;

            // 处理childrenIds引用
            if (node.childrenIds && Array.isArray(node.childrenIds)) {
                nestedNode.children = node.childrenIds
                    .map(childId => nodeMap.get(childId))
                    .filter(child => child)
                    .map(buildNestedNode);
            }

            // 处理直接嵌套的children
            if (node.children && Array.isArray(node.children)) {
                nestedNode.children = node.children.map(child => buildNestedNode(child));
            }

            // 记录使用的组件类型
            this.usedComponents.add(node.type);

            return nestedNode;
        };

        // 找到根节点（没有在其他节点的childrenIds中引用的节点）
        const allChildIds = new Set();
        flatSchema.forEach(node => {
            if (node.childrenIds) {
                node.childrenIds.forEach(childId => allChildIds.add(childId));
            }
        });

        const rootNodes = flatSchema.filter(node =>
            !allChildIds.has(node.id) && (!node.parentId || node.parentId === '')
        );

        return rootNodes.map(buildNestedNode);
    }

    /**
     * 解析单个节点
     * @param {Object} node 节点对象
     * @param {string} parentId 父组件ID
     * @returns {Object} 组件配置对象
     */
    parseNode(node, parentId = null) {
        const componentType = node.type;
        if (!componentType) {
            throw new Error('节点缺少type属性');
        }

        // 记录使用的组件类型
        this.usedComponents.add(componentType);

        // 构造组件配置
        const component = {
            type: componentType,
            props: { ...node },
            children: []
        };

        // 移除特殊字段
        delete component.props.type;
        delete component.props.children;
        delete component.props.childrenIds;

        // 递归处理子节点
        if (node.children && Array.isArray(node.children)) {
            component.children = node.children.map(child =>
                this.parseNode(child)
            );
        }

        // 处理amis兼容字段
        if (node.body && Array.isArray(node.body)) {
            component.children = node.body.map(child =>
                this.parseNode(child)
            );
        }

        return component;
    }

    /**
     * 从组件树生成代码
     * @param {Array} componentTree 组件树
     * @returns {string} 生成的React代码字符串
     */
    generateCodeFromComponentTree(componentTree) {
        const codeParts = [];

        // 添加React import
        codeParts.push("import React from 'react';");
        codeParts.push('');

        // 生成组件定义
        this.usedComponents.forEach(componentType => {
            codeParts.push(this.generateFunctionComponent(componentType));
            codeParts.push('');
        });

        // 生成App组件
        codeParts.push(this.generateAppComponent(componentTree));

        return codeParts.join('\n');
    }

    /**
     * 生成函数组件
     * @param {string} componentType 组件类型
     * @returns {string} 函数组件代码
     */
    generateFunctionComponent(componentType) {
        return `function ${componentType}({ ...props }) {
  return (
    <div className="${componentType.toLowerCase()}">
      ${this.generateComponentContent(componentType)}
    </div>
  );
}`;
    }

    /**
     * 生成组件内容
     * @param {string} componentType 组件类型
     * @returns {string} 组件内容代码
     */
    generateComponentContent(componentType) {
        switch (componentType) {
            case 'Button':
                return '<button {...props}>{props.text || "按钮"}</button>';
            case 'Input':
                return '<input {...props} />';
            case 'Form':
                return '<form>{props.children}</form>';
            case 'Row':
                return '<div className="row">{props.children}</div>';
            case 'Col':
                return '<div className="col">{props.children}</div>';
            default:
                return '<div>{props.children}</div>';
        }
    }

    /**
     * 生成App组件
     * @param {Array} componentTree 组件树
     * @returns {string} App组件代码
     */
    generateAppComponent(componentTree) {
        const childrenCode = componentTree.map(node =>
            this.generateNodeJSX(node)
        ).join('\n      ');

        return `function App() {
  return (
    <div className="app">
      ${childrenCode}
    </div>
  );
}

export default App;`;
    }

    /**
     * 生成节点JSX代码
     * @param {Object} node 节点对象
     * @returns {string} JSX代码
     */
    generateNodeJSX(node) {
        const attributes = this.generateJSXAttributes(node.props);
        const childrenCode = node.children && node.children.length > 0
            ? node.children.map(child => this.generateNodeJSX(child)).join('\n        ')
            : '';

        if (childrenCode) {
            return `<${node.type}${attributes}>
        ${childrenCode}
      </${node.type}>`;
        } else {
            return `<${node.type}${attributes} />`;
        }
    }

    /**
     * 生成JSX属性
     * @param {Object} props 属性对象
     * @returns {string} JSX属性字符串
     */
    generateJSXAttributes(props) {
        if (!props || typeof props !== 'object') {
            return '';
        }

        const attributes = Object.entries(props)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `${key}="${this.escapeString(value)}"`;
                } else {
                    return `${key}={${JSON.stringify(value)}}`;
                }
            })
            .join(' ');

        return attributes ? ' ' + attributes : '';
    }

    /**
     * 转义字符串中的特殊字符
     * @param {string} str 要转义的字符串
     * @returns {string} 转义后的字符串
     */
    escapeString(str) {
        return str.replace(/"/g, '"')
            .replace(/'/g, '&#39;')
            .replace(/</g, '<')
            .replace(/>/g, '>');
    }
}

/**
 * 导出配置为可下载的文件
 * @param {Object} schema JSON Schema对象
 * @param {string} fileName 文件名
 */
export function exportAsReactProjectWithBabel(schema, fileName = 'react-app-babel') {
    const generator = new BabelReactCodeGenerator();
    const code = generator.generateReactCode(schema);

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

// 导出生成器类
export default BabelReactCodeGenerator;
