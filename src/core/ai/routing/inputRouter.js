/**
 * 智能输入路由器 - 根据复杂度选择NLP引擎或规则引擎
 */

// 导入引擎
import { ruleEngine } from '../promptEngine';
import { nlpEngine } from './nlpEngine';

// 获取环境变量配置
const conditionKeywords = process.env.VITE_COMPLEXITY_CONDITION_KEYWORDS
    ? process.env.VITE_COMPLEXITY_CONDITION_KEYWORDS.split(',')
    : ['如果', '当', '条件'];

const entityThreshold = process.env.VITE_COMPLEXITY_ENTITY_THRESHOLD
    ? parseInt(process.env.VITE_COMPLEXITY_ENTITY_THRESHOLD)
    : 3;

const lengthThreshold = process.env.VITE_COMPLEXITY_LENGTH_THRESHOLD
    ? parseInt(process.env.VITE_COMPLEXITY_LENGTH_THRESHOLD)
    : 30;

/**
 * 判断输入是否为复杂需求
 * @param {string} text 用户输入文本
 * @returns {boolean} 是否为复杂需求
 */
export const isComplexInput = (text) => {
    // 条件1: 包含条件关键词
    const hasCondition = conditionKeywords.some(kw => text.includes(kw));

    // 条件2: 实体数量超阈值
    const entityCount = [
        ...text.matchAll(/(组件|属性|绑定|数据|字段|列)/g)
    ].length;

    // 条件3: 文本长度超阈值
    const isLongText = text.length > lengthThreshold;

    return hasCondition || entityCount >= entityThreshold || isLongText;
};

/**
 * 路由用户输入到合适的引擎
 * @param {string} userInput 用户输入
 * @returns {Promise<Object>} 组件配置
 */
// 初始化NLP引擎（异步）
let isNlpInitializing = false;
const ensureNlpInitialized = async () => {
    if (!nlpEngine.isInitialized && !isNlpInitializing) {
        isNlpInitializing = true;
        try {
            await nlpEngine.init();
        } catch (err) {
            console.error('[路由] NLP引擎初始化失败', err);
            throw new Error('NLP引擎初始化失败');
        } finally {
            isNlpInitializing = false;
        }
    }
};

export const routeInput = async (userInput) => {
    try {
        if (isComplexInput(userInput)) {
            console.log(`[路由] 复杂指令使用NLP引擎: ${userInput}`);
            await ensureNlpInitialized();
            return await nlpEngine.process(userInput);
        } else {
            console.log(`[路由] 简单指令使用规则引擎: ${userInput}`);
            return ruleEngine.generatePrompt(userInput);
        }
    } catch (error) {
        console.error(`[路由] 引擎选择失败: ${error.message}`);
        throw new Error(`输入路由失败: ${error.message}`);
    }
};
