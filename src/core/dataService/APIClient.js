/**
 * 统一API请求客户端
 * 功能：
 * 1. 支持REST/GraphQL请求配置
 * 2. 自动处理请求/响应转换
 * 3. 错误统一处理
 */
import axios from 'axios';

class APIClient {
    constructor(baseURL) {
        this.client = axios.create({ baseURL });
    }

    async request(config) {
        try {
            const response = await this.client.request(config);
            return response.data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // RESTful快捷方法
    get(endpoint, params) {
        return this.request({ method: 'GET', url: endpoint, params });
    }

    post(endpoint, data) {
        return this.request({ method: 'POST', url: endpoint, data });
    }

    // GraphQL支持
    query(gqlQuery, variables) {
        return this.request({
            method: 'POST',
            url: '/graphql',
            data: { query: gqlQuery, variables }
        });
    }
}

export default APIClient;
