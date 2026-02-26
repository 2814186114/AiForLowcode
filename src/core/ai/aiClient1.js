/**
 * AI客户端 - 与DeepSeek API通信
 */

import { buildSystemPrompt, ruleEngine } from './promptEngine';

// 会话上下文缓存 [sessionId -> history]
const sessionContexts = new Map();

/**
 * 管理会话历史记录
 * @param {string} sessionId 会话ID
 * @param {string} userInput 用户输入
 * @param {Object} schema 生成的Schema
 */
const updateSessionContext = (sessionId, userInput, schema) => {
    if (!sessionId) return;

    const history = sessionContexts.get(sessionId) || [];
    // 保留最近3条历史记录
    const newHistory = [...history, { userInput, schema }].slice(-3);
    sessionContexts.set(sessionId, newHistory);
};

/**
 * 生成JSON Schema (增强版支持会话上下文)
 * @param {string} userInput 用户输入文本
 * @param {string} [sessionId] 会话ID（可选）
 * @returns {Promise<Object>} 生成的JSON Schema
 */
export const generateSchema = async (userInput, sessionId = null) => {
    try {
        let fullPrompt = userInput;

        // 添加上下文历史记录
        if (sessionId && sessionContexts.has(sessionId)) {
            const history = sessionContexts.get(sessionId);
            const historyPrompt = history.map(item =>
                `历史输入: ${item.userInput}\n历史输出: ${JSON.stringify(item.schema)}`
            ).join('\n\n');

            fullPrompt = `${historyPrompt}\n\n当前输入: ${userInput}`;
        }

        // 使用增强后的提示词
        const promptText = await ruleEngine.generatePrompt(fullPrompt);

        // 构建DeepSeek API请求
        // 构建系统提示词（包含上下文标识）
        const systemPrompt = sessionId
            ? buildSystemPrompt(promptText, true)
            : buildSystemPrompt(promptText);
        const apiKey = process.env.REACT_APP_AI_API_KEY;
        const apiUrl = process.env.REACT_APP_AI_BASE_URL + '/chat/completions';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "你是一个前端组件配置生成器" },
                    { role: "user", content: systemPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API错误: ${response.statusText}`);
        }

        const data = await response.json();
        const aiOutput = data.choices[0].message.content.trim();

        // 尝试解析JSON输出
        try {
            // 清洗JSON字符串
            const cleanedOutput = cleanJSON(aiOutput);
            const schema = JSON.parse(cleanedOutput);
            if (validateSchema(schema)) {
                // 更新会话上下文
                updateSessionContext(sessionId, userInput, schema);
                return schema;
            } else {
                throw new Error('AI返回了无效的JSON Schema');
            }
        } catch (parseError) {
            console.error('JSON解析失败:', parseError.message);
            console.error('原始内容:', aiOutput);
            throw new Error(`AI响应格式错误: ${parseError.message}`);
        }
    } catch (error) {
        console.error('AI生成Schema失败:', error);
        throw new Error(`AI服务请求失败: ${error.message}`);
    }
};

/**
 * 验证JSON Schema是否符合规范
 * @param {Object} schema 待验证的JSON Schema
 * @returns {boolean} 是否有效
 */
/**
 * 清洗JSON字符串，移除注释和修复常见格式问题
 * @param {string} jsonString 原始JSON字符串
 * @returns {string} 清洗后的JSON字符串
 */
function cleanJSON(jsonString) {
    // 1. 移除单行注释
    jsonString = jsonString.replace(/\/\/.*$/gm, '');

    // 2. 移除多行注释
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');

    // 3. 修复对象和数组中的尾随逗号
    jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

    return jsonString;
}

export const validateSchema = (schema) => {
    // 验证字段更新为componentType
    return schema &&
        typeof schema === 'object' &&
        !Array.isArray(schema) &&
        schema.componentType !== undefined;
};
