module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback, // 保留已有的 fallback 配置
        "path": require.resolve("path-browserify"),
        "fs": false,
        "os": false,
        "crypto": false,
        "stream": false,
        "vm": false
    };
    // 禁用 ESLint 错误（临时方案）
    if (config.module && config.module.rules) {
        config.module.rules = config.module.rules.map(rule => {
            if (rule.use && rule.use.some(use => use.loader && use.loader.includes('eslint-loader'))) {
                return null; // 移除 eslint-loader
            }
            return rule;
        }).filter(Boolean);
    }
    return config;
};