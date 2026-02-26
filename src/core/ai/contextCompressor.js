/**
 * 上下文压缩模块 - 使用AI生成上下文摘要
 */

// 导入AI客户端（用于生成摘要）
// 注意：避免循环依赖，使用动态导入

/**
 * 上下文压缩模块
 * 使用AI生成上下文摘要
 */
export class ContextCompressor {
  // 缓存映射，用于缓存上下文摘要
  static summaryCache = new Map();
  
  // 缓存过期时间（毫秒）
  static CACHE_EXPIRY_TIME = 3600000; // 1小时
  
  /**
   * 生成上下文摘要
   * @param {Array} contextHistory 对话历史数组
   * @param {number} [maxLength=100] 摘要最大长度
   * @returns {Promise<string>} 生成的摘要
   */
  static async generateContextSummary(contextHistory, maxLength = 100) {
    // 检查上下文历史是否为空
    if (!contextHistory || contextHistory.length === 0) {
      return '';
    }
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(contextHistory, maxLength);
    
    // 检查缓存是否存在且未过期
    if (this.summaryCache.has(cacheKey)) {
      const cached = this.summaryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_EXPIRY_TIME) {
        console.log('使用缓存的上下文摘要');
        return cached.summary;
      }
    }
    
    console.log('生成新的上下文摘要...');
    
    // 构建上下文历史文本
    const historyText = this.buildHistoryText(contextHistory);
    
    // 生成摘要
    let summary = '';
    try {
      // 先尝试使用简单规则生成摘要（回退机制）
      summary = this.generateRuleBasedSummary(contextHistory);
      
      // 如果规则生成的摘要不够好，尝试使用AI生成
      if (summary.length === 0 || summary.length > maxLength * 1.5) {
        summary = await this.generateAISummary(historyText, maxLength);
      }
    } catch (error) {
      console.error('AI摘要生成失败，使用规则生成:', error.message);
      // 回退到规则生成
      summary = this.generateRuleBasedSummary(contextHistory);
    }
    
    // 缓存摘要
    this.summaryCache.set(cacheKey, {
      summary,
      timestamp: Date.now()
    });
    
    console.log('上下文摘要生成完成:', summary);
    return summary;
  }
  
  /**
   * 构建历史文本
   * @param {Array} contextHistory 对话历史数组
   * @returns {string} 构建后的历史文本
   */
  static buildHistoryText(contextHistory) {
    return contextHistory.map((item, index) => 
      `轮次${index + 1}:
用户输入: ${item.userInput}
系统输出: ${JSON.stringify(item.schema)}`
    ).join('\n\n');
  }
  
  /**
   * 使用AI生成摘要
   * @param {string} historyText 历史文本
   * @param {number} maxLength 摘要最大长度
   * @returns {Promise<string>} 生成的摘要
   */
  static async generateAISummary(historyText, maxLength) {
    // 动态导入AI客户端，避免循环依赖
    const { generateSchema } = await import('./aiClient');
    
    // 构建摘要prompt
    const summaryPrompt = `请将以下对话历史压缩为简洁的摘要，保留关键信息：

${historyText}

摘要要求：
1. 简洁明了，不超过${maxLength}字
2. 保留用户的核心需求和已完成的操作
3. 突出当前需要解决的问题
4. 用自然语言描述，不要包含代码或JSON
5. 只输出摘要，不要包含其他解释性文本`;
    
    // 调用AI生成摘要
    const result = await generateSchema(summaryPrompt, null, []);
    
    // 提取摘要（注意：这里需要根据实际API返回格式调整）
    let summary = '';
    if (result.summary) {
      summary = result.summary;
    } else if (result.content) {
      summary = result.content;
    } else if (typeof result === 'string') {
      summary = result;
    } else {
      // 如果无法提取摘要，回退到规则生成
      summary = this.generateRuleBasedSummary(JSON.parse(result.contextHistory || '[]'));
    }
    
    // 确保摘要长度不超过限制
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength) + '...';
    }
    
    return summary;
  }
  
  /**
   * 使用规则生成摘要（回退机制）
   * @param {Array} contextHistory 对话历史数组
   * @returns {string} 生成的摘要
   */
  static generateRuleBasedSummary(contextHistory) {
    // 提取关键信息
    const keyInfo = {
      userGoals: [],
      componentsUsed: new Set(),
      actions: [],
      currentTask: ''
    };
    
    // 分析对话历史
    contextHistory.forEach((item, index) => {
      const userInput = item.userInput;
      const schema = item.schema;
      
      // 提取用户目标
      if (userInput.includes('构建') || userInput.includes('创建') || 
          userInput.includes('生成') || userInput.includes('设计')) {
        keyInfo.userGoals.push(userInput);
        keyInfo.currentTask = userInput;
      }
      
      // 提取使用的组件
      if (schema && schema.componentType) {
        keyInfo.componentsUsed.add(schema.componentType);
      }
      
      // 提取操作类型
      if (userInput.includes('配置') || userInput.includes('设置') || 
          userInput.includes('调整') || userInput.includes('修改') ||
          userInput.includes('API') || userInput.includes('调用')) {
        keyInfo.actions.push(userInput);
      }
    });
    
    // 构建摘要
    const summaryParts = [];
    
    // 添加用户目标
    if (keyInfo.userGoals.length > 0) {
      const latestGoal = keyInfo.userGoals[keyInfo.userGoals.length - 1];
      summaryParts.push(`用户正在${latestGoal}`);
    }
    
    // 添加使用的组件
    if (keyInfo.componentsUsed.size > 0) {
      summaryParts.push(`已使用${Array.from(keyInfo.componentsUsed).join('、')}`);
    }
    
    // 添加操作
    if (keyInfo.actions.length > 0) {
      const latestAction = keyInfo.actions[keyInfo.actions.length - 1];
      summaryParts.push(`现在需要${latestAction}`);
    }
    
    // 生成最终摘要
    let summary = summaryParts.join('，');
    
    // 如果摘要太长，进行截断
    if (summary.length > 150) {
      summary = summary.substring(0, 150) + '...';
    }
    
    return summary;
  }
  
  /**
   * 生成缓存键
   * @param {Array} contextHistory 对话历史数组
   * @param {number} maxLength 摘要最大长度
   * @returns {string} 缓存键
   */
  static generateCacheKey(contextHistory, maxLength) {
    // 使用对话历史的哈希值和最大长度生成缓存键
    const historyStr = JSON.stringify(contextHistory.map(item => ({ 
      userInput: item.userInput, 
      componentType: item.schema?.componentType 
    })));
    
    // 生成简单哈希
    let hash = 0;
    for (let i = 0; i < historyStr.length; i++) {
      const char = historyStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `summary_${hash}_${maxLength}`;
  }
  
  /**
   * 清除缓存
   */
  static clearCache() {
    this.summaryCache.clear();
    console.log('上下文摘要缓存已清除');
  }
  
  /**
   * 获取缓存状态
   * @returns {Object} 缓存状态
   */
  static getCacheStatus() {
    return {
      cacheSize: this.summaryCache.size,
      cacheEntries: Array.from(this.summaryCache.keys())
    };
  }
  
  /**
   * 压缩上下文历史（移除旧的历史记录）
   * @param {Array} contextHistory 对话历史数组
   * @param {number} [maxHistoryLength=5] 保留的最大历史记录数量
   * @returns {Array} 压缩后的对话历史
   */
  static compressHistory(contextHistory, maxHistoryLength = 5) {
    if (!contextHistory || contextHistory.length <= maxHistoryLength) {
      return contextHistory;
    }
    
    // 保留最近的maxHistoryLength条记录
    return contextHistory.slice(-maxHistoryLength);
  }
}
