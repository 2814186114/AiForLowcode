/**
 * AI客户端 - 与AI API通信，实现优化的上下文管理
 */

// 导入核心模块
import { IntentRecognizer } from './intentRecognizer';
import { VectorRetriever } from './vectorRetriever';
import { ContextCompressor } from './contextCompressor';

/**
 * 生成JSON Schema (优化版支持会话上下文)
 * @param {string} userInput 用户输入文本
 * @param {string} [sessionId] 会话ID（可选）
 * @param {Array} [contextHistory] 上下文历史（可选）
 * @returns {Promise<Object>} 生成的JSON Schema
 */
export const generateSchema = async (userInput, sessionId = null, contextHistory = []) => {
    try {
        // 记录调用开始时间（用于性能监控）
        const startTime = Date.now();

        console.log('=== AI生成请求开始 ===');
        console.log('用户输入:', userInput);
        console.log('会话ID:', sessionId);
        console.log('上下文历史长度:', contextHistory.length);

        // 1. 意图识别 - 识别用户意图
        let intent = '';
        try {
            intent = await IntentRecognizer.recognizeIntent(userInput);
            console.log('意图识别结果:', intent);
        } catch (intentError) {
            console.error('意图识别失败:', intentError.message);
            // 意图识别失败不影响后续流程，继续执行
        }

        // 2. 向量检索 - 获取相关组件文档
        let relevantDocs = [];
        try {
            relevantDocs = await VectorRetriever.retrieveRelevantDocs(userInput);
            console.log('向量检索结果数量:', relevantDocs.length);
        } catch (retrievalError) {
            console.error('向量检索失败:', retrievalError.message);
            // 向量检索失败不影响后续流程，继续执行
        }

        // 3. 上下文压缩 - 生成对话历史摘要
        let contextSummary = '';
        try {
            contextSummary = await ContextCompressor.generateContextSummary(contextHistory);
            console.log('上下文摘要:', contextSummary);
        } catch (compressionError) {
            console.error('上下文压缩失败:', compressionError.message);
            // 上下文压缩失败不影响后续流程，继续执行
        }

        // 4. 构建优化后的prompt
        let fullPrompt = `用户需求：${userInput}`;

        // 添加上下文摘要
        if (contextSummary) {
            fullPrompt = `${contextSummary}\n\n${fullPrompt}`;
        }

        // 添加相关组件文档
        if (relevantDocs && relevantDocs.length > 0) {
            const componentDocsText = relevantDocs
                .map(doc => `\n## ${doc.type}\n${doc.summary}\n\n关键属性：${doc.keyProperties.join(', ')}\n\n示例：${JSON.stringify(doc.example)}`)
                .join('\n');

            fullPrompt += `\n\n相关组件参考：${componentDocsText}`;
        }

        // 添加生成格式要求
        fullPrompt += `\n\n请严格按照以下格式生成JSON Schema：
{
  "componentType": "组件类型",
  "props": {
    // 组件属性
  }
}`;

        console.log('最终生成的Prompt长度:', fullPrompt.length);

        // 5. 调用AI API生成Schema
        const schema = await callAIAPI(fullPrompt);

        // 记录调用结束时间和性能指标
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('=== AI生成请求完成 ===');
        console.log('响应时间:', responseTime, 'ms');
        console.log('生成结果:', schema);

        // 6. 返回生成结果
        return schema;
    } catch (error) {
        console.error('AI生成Schema失败:', error);
        throw new Error(`AI服务请求失败: ${error.message}`);
    }
};

/**
 * 调用AI API生成Schema
 * @param {string} prompt 完整的Prompt文本
 * @returns {Promise<Object>} 生成的JSON Schema
 */
async function callAIAPI(prompt) {
    try {
        // 构建系统提示词
        const systemPrompt = buildSystemPrompt();

        // 构建API请求参数
        const apiKey = process.env.REACT_APP_AI_API_KEY;
        const apiUrl = process.env.REACT_APP_AI_BASE_URL + '/chat/completions';

        // 配置模型参数
        const modelParams = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1500,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        // 调用DeepSeek API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(modelParams)
        });

        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `DeepSeek API错误: ${response.status} ${response.statusText}` +
                (errorData.error ? ` - ${errorData.error.message}` : '')
            );
        }

        // 解析响应数据
        const data = await response.json();
        const aiOutput = data.choices[0].message.content.trim();

        // 解析JSON输出
        return parseAIOutput(aiOutput);
    } catch (error) {
        console.error('AI API调用失败:', error);
        throw error;
    }
}

/**
 * 构建系统提示词
 * @returns {string} 系统提示词
 */
function buildSystemPrompt() {
    return `你是一个专业的低代码平台组件生成器，请根据用户需求生成符合规范的JSON Schema。

你的任务：
1. 理解用户的需求和上下文
2. 参考提供的组件文档
3. 生成符合规范的JSON Schema

输出要求：
1. 只输出JSON格式，不要包含其他解释性文本
2. JSON格式必须严格符合规范，可直接解析
3. 确保componentType和props字段存在
4. 组件类型必须是系统支持的有效类型
5. 属性值必须符合组件的属性规范`;
}

/**
 * 解析AI输出，提取JSON Schema
 * @param {string} aiOutput AI生成的原始输出
 * @returns {Object} 解析后的JSON Schema
 */
function parseAIOutput(aiOutput) {
    console.log('AI原始输出:', aiOutput);
    
    // 清洗JSON字符串（移除可能的Markdown格式）
    const cleanedOutput = cleanJSONOutput(aiOutput);
    
    try {
        // 解析JSON
        const schema = JSON.parse(cleanedOutput);
        
        // 验证Schema格式
        validateSchema(schema);
        
        return schema;
    } catch (parseError) {
        console.error('JSON解析失败:', parseError.message);
        console.error('清洗后的输出:', cleanedOutput);
        throw new Error(`AI响应格式错误: ${parseError.message}`);
    }
}

/**
 * 清洗AI输出的JSON字符串
 * @param {string} output AI生成的原始输出
 * @returns {string} 清洗后的JSON字符串
 */
function cleanJSONOutput(output) {
    // 移除可能的Markdown代码块标记
    let cleaned = output;
    cleaned = cleaned.replace(/^```json\s*|\s*```$/g, '');
    cleaned = cleaned.replace(/^```\s*|\s*```$/g, '');
    
    // 移除可能的解释性文本
    const jsonStartIndex = cleaned.indexOf('{');
    const jsonEndIndex = cleaned.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        cleaned = cleaned.substring(jsonStartIndex, jsonEndIndex + 1);
    }
    
    return cleaned.trim();
}

/**
 * 验证生成的Schema格式
 * @param {Object} schema 生成的JSON Schema
 * @throws {Error} 如果Schema格式无效，抛出错误
 */
function validateSchema(schema) {
    // 检查必要字段
    if (!schema) {
        throw new Error('Schema不能为空');
    }
    
    if (!schema.componentType) {
        throw new Error('Schema缺少componentType字段');
    }
    
    if (typeof schema.props !== 'object') {
        throw new Error('Schema的props字段必须是对象');
    }
    
    // 检查组件类型是否为字符串
    if (typeof schema.componentType !== 'string') {
        throw new Error('componentType必须是字符串');
    }
    
    // 检查props是否为对象
    if (schema.props === null || typeof schema.props !== 'object') {
        throw new Error('props必须是对象');
    }
    
    console.log('Schema验证通过');
}

/**
 * 初始化AI客户端
 * 预加载模型和初始化向量数据库
 */
export const initAIClient = async () => {
    console.log('初始化AI客户端...');
    
    try {
        // 初始化意图识别模块
        await IntentRecognizer.initModel();
        console.log('意图识别模块初始化完成');
        
        // 初始化向量检索模块
        await VectorRetriever.init();
        console.log('向量检索模块初始化完成');
        
        console.log('AI客户端初始化完成');
        return true;
    } catch (error) {
        console.error('AI客户端初始化失败:', error.message);
        return false;
    }
};

/**
 * 计算Token使用量（估算）
 * @param {string} text 文本内容
 * @returns {number} 估算的Token数量
 */
export const estimateTokenCount = (text) => {
    // 简单估算：1个Token约等于4个字符
    return Math.ceil(text.length / 4);
};

/**
 * 获取AI客户端状态
 * @returns {Object} AI客户端状态
 */
export const getAIClientStatus = () => {
    return {
        intentRecognizerReady: IntentRecognizer.classifier !== null,
        vectorRetrieverReady: VectorRetriever.client !== null,
        embedderReady: VectorRetriever.embedder !== null
    };
};