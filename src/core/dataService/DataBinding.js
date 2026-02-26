/**
 * 数据绑定引擎
 * 功能：
 * 1. 建立组件属性与数据源的映射关系
 * 2. 自动监听数据变化更新组件
 */
import { useEffect } from 'react';
import APIClient from './APIClient';

class DataBindingEngine {
    constructor() {
        this.bindings = new Map();
        this.apiClient = new APIClient(process.env.REACT_APP_API_BASE);
        this.activeRequests = new Map();
    }

    // 注册数据绑定
    registerBinding(componentId, propName, dataSource) {
        const bindingKey = `${componentId}-${propName}`;
        this.bindings.set(bindingKey, dataSource);
    }

    // 执行数据获取并更新组件
    async updateComponentData(componentId, updateCallback) {
        const updates = {};

        for (const [key, dataSource] of this.bindings.entries()) {
            if (key.startsWith(`${componentId}-`)) {
                const propName = key.split('-')[1];
                try {
                    const requestKey = `${componentId}-${propName}`;
                    // 取消进行中的相同请求
                    if (this.activeRequests.has(requestKey)) {
                        this.activeRequests.get(requestKey).abort();
                    }

                    const controller = new AbortController();
                    this.activeRequests.set(requestKey, controller);

                    const data = await this.fetchData(dataSource, controller.signal);
                    updates[propName] = data;
                    this.activeRequests.delete(requestKey);
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error(`更新组件${componentId}数据失败:`, error);
                    }
                }
            }
        }

        updateCallback(updates);
    }

    async fetchData(dataSource, signal) {
        if (dataSource.type === 'api') {
            return this.apiClient.get(dataSource.endpoint, {
                ...dataSource.params,
                signal  // 传递AbortSignal以支持请求取消
            });
        }
        // 支持其他数据源类型：localStorage/graphQL/websocket等
        return null;
    }

    // 清理资源
    cleanup() {
        // 取消所有进行中的请求
        for (const controller of this.activeRequests.values()) {
            controller.abort();
        }
        this.activeRequests.clear();
    }
}

// React Hook封装
export function useDataBinding(engine, componentId, updateCallback) {
    useEffect(() => {
        engine.updateComponentData(componentId, updateCallback);
        // 实际应用需添加依赖项和清理逻辑
    }, []);
}

export default DataBindingEngine;
