/**
 * NLP引擎 - 使用TensorFlow.js和Compromise处理复杂指令
 */

import * as use from '@tensorflow-models/universal-sentence-encoder';
import nlp from 'compromise';

// 业务意图向量参考值（示例）
const INTENT_VECTORS = {
    CREATE: [0.8, 0.2, 0.1, 0.6, 0.3],
    UPDATE: [0.1, 0.7, 0.5, 0.2, 0.9],
    CONDITION: [0.3, 0.6, 0.8, 0.4, 0.2]
};

// 组件类型映射
const COMPONENT_MAP = {
    表单: 'Form',
    表格: 'Table',
    按钮: 'Button',
    输入框: 'Input',
    选择器: 'Select',
    开关: 'Switch'
};

export const nlpEngine = {
    model: null,
    isInitialized: false,

    /**
     * 初始化NLP模型
     */
    async init() {
        if (!this.isInitialized) {
            console.log('[NLP] 加载语义编码模型...');
            this.model = await use.load();
            this.isInitialized = true;
        }
    },

    /**
     * 处理用户输入
     * @param {string} text 用户输入文本
     * @returns {Promise<Object>} 组件配置
     */
    async process(text) {
        await this.init();

        // 语义编码
        const embeddings = await this.model.embed([text]);
        const vector = await embeddings.array();

        // 实体识别
        const doc = nlp(text);
        const nouns = doc.nouns().out('array');
        const verbs = doc.verbs().out('array');

        // 业务逻辑映射
        return this.mapToConfig(vector[0], nouns, verbs, text);
    },

    /**
     * 映射到组件配置
     * @param {Array} vector 语义向量
     * @param {Array} nouns 名词实体
     * @param {Array} verbs 动词实体
     * @param {string} text 原始文本
     * @returns {Object} 组件配置
     */
    mapToConfig(vector, nouns, verbs, text) {
        // 计算意图相似度
        const intentScores = {
            create: this.cosineSimilarity(vector, INTENT_VECTORS.CREATE),
            update: this.cosineSimilarity(vector, INTENT_VECTORS.UPDATE),
            condition: this.cosineSimilarity(vector, INTENT_VECTORS.CONDITION)
        };

        // 确定主要意图
        const mainIntent = Object.keys(intentScores).reduce((a, b) =>
            intentScores[a] > intentScores[b] ? a : b
        );

        // 提取组件类型
        const components = nouns.filter(noun =>
            Object.keys(COMPONENT_MAP).includes(noun)
        ).map(noun => COMPONENT_MAP[noun]);

        // 提取条件表达式
        const condition = this.extractCondition(text);

        return {
            intent: mainIntent,
            components: components.length ? components : ['Container'],
            properties: this.extractProperties(nouns),
            condition
        };
    },

    /**
     * 计算余弦相似度
     * @param {Array} vecA 向量A
     * @param {Array} vecB 向量B
     * @returns {number} 相似度得分
     */
    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    },

    /**
     * 提取条件表达式
     * @param {string} text 原始文本
     * @returns {string|null} 条件表达式
     */
    extractCondition(text) {
        const conditionRegex = /(如果|若|当)(.+?)(则|显示)/;
        const match = text.match(conditionRegex);
        return match ? match[2].trim() : null;
    },

    /**
     * 提取属性参数
     * @param {Array} nouns 名词列表
     * @returns {Object} 属性键值对
     */
    extractProperties(nouns) {
        const props = {};
        // 示例实现 - 实际应根据业务需求增强
        if (nouns.includes('必填')) props.required = true;
        if (nouns.includes('禁用')) props.disabled = true;
        return props;
    }
};
