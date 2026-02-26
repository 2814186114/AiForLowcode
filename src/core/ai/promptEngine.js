/**
 * 提示词引擎 - 生成结构化提示词
 */

// 组件类型到提示词模板的映射
const componentTemplates = {
    Form: (fields, buttonText) =>
        `生成一个包含以下字段的表单：${fields.join(', ')}。表单底部显示"${buttonText}"按钮。`,

    Table: (columns, dataSource) =>
        `生成一个表格组件，包含以下列：${columns.join(', ')}。数据来源：${dataSource}。`,

    Card: (title, content) =>
        `生成一个卡片组件，标题为"${title}"，内容区域显示：${content}。`,

    Input: (label, placeholder) =>
        `生成一个输入框组件，标签为"${label}"，占位符文本为"${placeholder}"。`,

    Button: (text, type) =>
        `生成一个按钮组件，显示文本"${text}"，类型为${type}。`
};

// 规则引擎对象
export const ruleEngine = {
    /**
     * 根据简单文本生成组件配置
     * @param {string} text 用户输入文本
     * @returns {string} 结构化提示词
     */
    generatePrompt(text) {
        // 简单关键词匹配
        if (text.includes('表单') || text.includes('form')) {
            const fields = text.match(/(用户名|密码|邮箱|电话)/g) || ['字段1', '字段2'];
            return componentTemplates.Form(fields, '提交');
        } else if (text.includes('表格') || text.includes('table')) {
            const columns = text.match(/(姓名|年龄|地址)/g) || ['列1', '列2'];
            return componentTemplates.Table(columns, 'API数据源');
        } else if (text.includes('按钮') || text.includes('button')) {
            const btnText = text.match(/(确定|取消|提交)/)?.[0] || '按钮';
            return componentTemplates.Button(btnText, 'primary');
        }

        // 默认使用原始生成逻辑
        const componentType = text.match(/(表单|表格|卡片|输入框|按钮)/)?.[0] || 'Form';
        return generatePrompt(componentType, {});
    }
};

/**
 * 根据组件类型生成提示词
 * @param {string} componentType 组件类型 (Form/Table/Card等)
 * @param {Object} props 组件属性
 * @returns {string} 结构化提示词
 */
/**
 * 根据组件类型生成提示词
 * @param {string} componentType 组件类型 (Form/Table/Card等)
 * @param {Object} props 组件属性
 * @returns {string} 结构化提示词
 */
export const generatePrompt = (componentType, props) => {
    const template = componentTemplates[componentType];
    if (!template) {
        throw new Error(`未知组件类型: ${componentType}`);
    }

    return template(...Object.values(props));
};

/**
 * 生成完整系统提示
 * @param {string} userPrompt 用户原始提示
 * @param {boolean} [hasContext=false] 是否包含上下文历史
 * @returns {string} 完整系统提示
 */
export const buildSystemPrompt = (userPrompt, hasContext = false) => {
    let contextInstruction = '';
    if (hasContext) {
        contextInstruction = '注意：以下需求包含历史上下文，请根据上下文保持一致性。\n\n';
    }

    return `${contextInstruction}你是一个低代码平台组件配置生成器。请根据用户描述生成对应的组件JSON配置。

组件类型映射规则：
- 按钮/Button => Button
- 输入框/文本框 => Input
- 选择器/下拉框 => Select
- 开关 => Switch
- 滑块 => Slider
- 日期选择器 => DatePicker
- 表单/多字段 => Form
- 行布局 => Row
- 列布局 => Col

组件属性规范：
- Button: { label: string, type?: "primary"|"dashed"|"link"|"text"|"default" }
- Input: { label: string, placeholder?: string, type?: "text"|"password"|"number" }
- Select: { label: string, options: Array<{label: string, value: string}> }
- Switch: { label: string, defaultChecked?: boolean }
- Slider: { label: string, min?: number, max?: number, step?: number, defaultValue?: number }
- DatePicker: { label: string, placeholder?: string }
- Form: { children: Array<ComponentConfig> }
- Row: { children: Array<ComponentConfig> }
- Col: { children: Array<ComponentConfig> }

响应格式：
{
  "componentType": "组件类型",
  "props": {
    // 组件属性
  }
}

示例输出：
用户需求: "创建一个登录表单，包含用户名和密码输入框以及提交按钮"
输出:
{
  "componentType": "Form",
  "props": {
    "children": [
      { "componentType": "Input", "props": { "label": "用户名", "placeholder": "请输入用户名" } },
      { "componentType": "Input", "props": { "label": "密码", "type": "password" } },
      { "componentType": "Button", "props": { "label": "登录", "type": "primary" } }
    ]
  }
}

需求描述：
${userPrompt}

${hasContext ? '注意：请保持与历史上下文的一致性，不要重复生成相同组件，而是在原有基础上修改。\n\n' : ''}输出要求：
1. 只输出有效的JSON对象，不要包含任何解释性文本
2. 使用指定的响应格式
3. 确保组件类型符合映射规则
4. 确保格式正确，无语法错误`;
};
