/**
 * 意图识别模块 - 使用轻量NLP模型识别用户意图
 */

import { pipeline } from '@xenova/transformers';

/**
 * 意图识别模块
 * 使用轻量NLP模型识别用户意图
 */
export class IntentRecognizer {
  // 意图分类模型实例
  static classifier = null;
  
  // 意图类型映射
  static intentTypes = {
    COMPONENT_CREATE: '创建组件',
    COMPONENT_CONFIGURE: '配置组件',
    API_INTEGRATION: 'API集成',
    STYLE_ADJUSTMENT: '样式调整',
    LAYOUT_DESIGN: '布局设计',
    DATA_BINDING: '数据绑定',
    EVENT_HANDLING: '事件处理',
    OTHER: '其他'
  };
  
  // 意图关键词映射（用于回退机制）
  static intentKeywords = {
    [this.intentTypes.COMPONENT_CREATE]: ['创建', '添加', '生成', '新建', '创建一个'],
    [this.intentTypes.COMPONENT_CONFIGURE]: ['配置', '设置', '调整', '修改', '编辑'],
    [this.intentTypes.API_INTEGRATION]: ['API', '接口', '调用'],
  }
}