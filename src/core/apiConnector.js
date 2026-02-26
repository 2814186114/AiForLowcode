/**
 * API连接器 - 支持REST/GraphQL
 * 提供统一接口与后端服务通信
 */
export class APIConnector {
    // 配置映射表 { apiName: { endpoint, method, headers, params } }
    static config = {};

    /**
     * 注册API配置
     * @param {string} apiName - API唯一标识
     * @param {Object} config - 配置对象
     * @param {string} config.endpoint - API地址
     * @param {'GET'|'POST'|'PUT'|'DELETE'} [config.method='GET'] - 请求方法
     * @param {Object} [config.headers] - 请求头
     * @param {Object} [config.params] - 默认参数
     */
    static registerAPI(apiName, config) {
        this.config[apiName] = {
            method: 'GET',
            ...config
        };
    }

    /**
     * 执行API请求
     * @param {string} apiName - 注册的API名称
     * @param {Object} [data] - 请求数据
     * @param {Object} [options] - 请求选项
     * @returns {Promise} 请求结果
     */
    static async call(apiName, data = {}, options = {}) {
        const apiConfig = this.config[apiName];
        if (!apiConfig) {
            throw new Error(`未注册的API: ${apiName}`);
        }

        const { endpoint, method, headers: defaultHeaders } = apiConfig;
        const { headers = {}, params = {}, ...fetchOptions } = options;

        // 合并参数
        const requestParams = {
            ...apiConfig.params,
            ...params
        };

        // 构建请求配置
        const requestConfig = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...defaultHeaders,
                ...headers
            },
            ...fetchOptions
        };

        // 处理GET请求参数
        let url = endpoint;
        if (method === 'GET' && Object.keys(requestParams).length > 0) {
            const query = new URLSearchParams(requestParams).toString();
            url += `?${query}`;
        } else if (['POST', 'PUT'].includes(method)) {
            requestConfig.body = JSON.stringify({
                ...requestParams,
                ...data
            });
        }

        try {
            const response = await fetch(url, requestConfig);
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`API调用错误 [${apiName}]:`, error);
            throw error;
        }
    }

    // GraphQL专用方法
    static async graphql(query, variables = {}) {
        return this.call('graphql', { query, variables }, {
            method: 'POST'
        });
    }

    /**
     * 调用AI服务生成JSON Schema
     * @param {string} prompt 自然语言描述
     * @returns {Promise<Object>} 生成的JSON Schema
     */
    static async aiGenerateSchema(prompt) {
        // 动态导入aiClient以避免循环依赖
        const { generateSchema } = await import('./ai/aiClient');
        return generateSchema(prompt);
    }
}

// 示例API注册
APIConnector.registerAPI('getUsers', {
    endpoint: 'http://localhost:4000/users',
    method: 'GET'
});

APIConnector.registerAPI('getProducts', {
    endpoint: 'http://localhost:4000/products',
    method: 'GET'
});

// 注册AI服务API
APIConnector.registerAPI('ai-generate-schema', {
    endpoint: 'http://localhost:3001/ai/generate-schema',
    method: 'POST'
});
