/**
 * 向量检索模块 - 使用向量数据库检索相关组件文档
 */

import { ChromaClient } from 'chromadb';
import { pipeline } from '@xenova/transformers';

/**
 * 向量检索模块
 * 使用向量数据库检索相关组件文档
 */
export class VectorRetriever {
  // ChromaDB客户端实例
  static client = null;
  // 向量嵌入模型
  static embedder = null;
  // 集合名称
  static COLLECTION_NAME = 'component_docs';

  // 默认组件文档库
  static defaultComponentDocs = [
    {
      type: 'Button',
      summary: '按钮组件，用于触发用户交互操作',
      keyProperties: ['label', 'type', 'onClick', 'apiConfig', 'disabled', 'loading'],
      example: {
        componentType: 'Button',
        props: {
          label: '提交',
          type: 'primary',
          onClick: 'submitForm',
          disabled: false,
          loading: false
        }
      }
    },
    {
      type: 'Input',
      summary: '输入框组件，用于用户输入文本',
      keyProperties: ['label', 'placeholder', 'value', 'onChange', 'type', 'disabled'],
      example: {
        componentType: 'Input',
        props: {
          label: '用户名',
          placeholder: '请输入用户名',
          value: '',
          onChange: 'handleInputChange',
          type: 'text',
          disabled: false
        }
      }
    },
    {
      type: 'Select',
      summary: '选择器组件，用于从列表中选择值',
      keyProperties: ['options', 'defaultValue', 'onChange', 'disabled'],
      example: {
        componentType: 'Select',
        props: {
          options: ['选项1', '选项2', '选项3'],
          defaultValue: '选项1',
          onChange: 'handleSelectChange',
          disabled: false
        }
      }
    },
    {
      type: 'Switch',
      summary: '开关组件，用于开启/关闭状态切换',
      keyProperties: ['checked', 'onChange', 'disabled'],
      example: {
        componentType: 'Switch',
        props: {
          checked: false,
          onChange: 'handleSwitchChange',
          disabled: false
        }
      }
    },
    {
      type: 'Slider',
      summary: '滑块组件，用于选择范围内的值',
      keyProperties: ['min', 'max', 'defaultValue', 'onChange', 'disabled'],
      example: {
        componentType: 'Slider',
        props: {
          min: 0,
          max: 100,
          defaultValue: 50,
          onChange: 'handleSliderChange',
          disabled: false
        }
      }
    },
    {
      type: 'DatePicker',
      summary: '日期选择器，用于选择日期或日期时间',
      keyProperties: ['placeholder', 'format', 'showTime', 'value', 'onChange'],
      example: {
        componentType: 'DatePicker',
        props: {
          placeholder: '请选择日期',
          format: 'YYYY-MM-DD',
          showTime: false,
          value: '',
          onChange: 'handleDateChange'
        }
      }
    },
    {
      type: 'Row',
      summary: '行布局组件，用于创建水平布局',
      keyProperties: ['gutter', 'justify', 'align', 'width', 'height'],
      example: {
        componentType: 'Row',
        props: {
          gutter: 16,
          justify: 'start',
          align: 'top',
          width: '100%',
          height: 'auto'
        }
      }
    },
    {
      type: 'Col',
      summary: '列布局组件，用于创建垂直布局',
      keyProperties: ['span', 'offset', 'height', 'width'],
      example: {
        componentType: 'Col',
        props: {
          span: 12,
          offset: 0,
          height: 'auto',
          width: '100%'
        }
      }
    },
    {
      type: 'LoginForm',
      summary: '登录表单组件，用于用户登录功能',
      keyProperties: ['preview'],
      example: {
        componentType: 'LoginForm',
        props: {
          preview: false
        }
      }
    }
  ];

  /**
   * 初始化向量数据库和嵌入模型
   */
  static async init() {
    // 初始化ChromaDB客户端
    if (!this.client) {
      console.log('初始化ChromaDB客户端...');
      this.client = new ChromaClient();

      // 创建集合（如果不存在）
      await this.client.getOrCreateCollection({
        name: this.COLLECTION_NAME,
        metadata: { description: 'Component documentation collection' }
      });
      console.log('ChromaDB客户端初始化完成');

      // 初始化默认组件文档
      await this.initDefaultComponentDocs();
    }

    // 初始化嵌入模型
    if (!this.embedder) {
      console.log('初始化向量嵌入模型...');
      this.embedder = await pipeline('feature-extraction', {
        model: 'Xenova/all-MiniLM-L6-v2',
        quantized: true
      });
      console.log('向量嵌入模型初始化完成');
    }
  }

  /**
   * 初始化默认组件文档
   */
  static async initDefaultComponentDocs() {
    const collection = await this.client.getCollection({
      name: this.COLLECTION_NAME
    });

    // 检查集合中是否已有文档
    const count = await collection.count();
    if (count === 0) {
      console.log('初始化默认组件文档...');

      // 批量添加默认文档
      for (const doc of this.defaultComponentDocs) {
        await this.addComponentDoc(doc);
      }

      console.log('默认组件文档初始化完成');
    }
  }

  /**
   * 生成文本嵌入向量
   * @param {string} text 文本内容
   * @returns {Promise<Array<number>>} 嵌入向量
   */
  static async generateEmbedding(text) {
    await this.init();

    // 生成嵌入向量
    const result = await this.embedder(text, {
      pooling: 'mean',
      normalize: true
    });

    // 转换为普通数组
    return Array.from(result.data);
  }

  /**
   * 添加组件文档到向量数据库
   * @param {Object} componentDoc 组件文档
   */
  static async addComponentDoc(componentDoc) {
    await this.init();

    const collection = await this.client.getCollection({
      name: this.COLLECTION_NAME
    });

    // 生成文档的文本表示
    const docText = `${componentDoc.type}: ${componentDoc.summary} ${componentDoc.keyProperties.join(' ')}`;

// 生成嵌入向量
// const embedding = await this.generateEmbedding(docText);
    
    // 添加到集合
    await collection.add({
      ids: [componentDoc.type],
      embeddings: [embedding],
      documents: [JSON.stringify(componentDoc)],
      metadatas: [{ type: componentDoc.type, summary: componentDoc.summary }]
    });
    
    console.log(`组件文档添加成功: ${componentDoc.type}`);
  }
  
  /**
   * 检索相关组件文档
   * @param {string} query 用户查询文本
   * @param {number} [topK=3] 返回结果数量
   * @returns {Promise<Array<Object>>} 检索到的组件文档
   */
  static async retrieveRelevantDocs(query, topK = 3) {
    await this.init();
    
    const collection = await this.client.getCollection({
      name: this.COLLECTION_NAME
    });
    
    try {
      // 生成查询向量
      const queryEmbedding = await this.generateEmbedding(query);
      
      // 执行相似性搜索
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        include: ['documents', 'metadatas', 'distances']
      });
      
      // 解析结果
      const relevantDocs = [];
      if (results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          try {
            const doc = JSON.parse(results.documents[0][i]);
            const metadata = results.metadatas[0][i];
            const distance = results.distances[0][i];
            
            relevantDocs.push({
              ...doc,
              metadata,
              similarity: 1 - distance // 转换为相似度（1表示完全匹配）
            });
          } catch (parseError) {
            console.error('解析组件文档失败:', parseError.message);
          }
        }
      }
      
      return relevantDocs;
    } catch (error) {
      console.error('向量检索失败:', error.message);
      return [];
    }
  }
  
  /**
   * 更新组件文档
   * @param {Object} componentDoc 组件文档
   */
  static async updateComponentDoc(componentDoc) {
    await this.init();
    
    // 先删除旧文档
    await this.deleteComponentDoc(componentDoc.type);
    
    // 添加新文档
    await this.addComponentDoc(componentDoc);
    
    console.log(`组件文档更新成功: ${componentDoc.type}`);
  }
  
  /**
   * 删除组件文档
   * @param {string} componentType 组件类型
   */
  static async deleteComponentDoc(componentType) {
    await this.init();
    
    const collection = await this.client.getCollection({
      name: this.COLLECTION_NAME
    });
    
    await collection.delete({
      ids: [componentType]
    });
    
    console.log(`组件文档删除成功: ${componentType}`);
  }
  
  /**
   * 获取所有组件文档
   * @returns {Promise<Array<Object>>} 所有组件文档
   */
  static async getAllComponentDocs() {
    await this.init();
    
    const collection = await this.client.getCollection({
      name: this.COLLECTION_NAME
    });
    
    const results = await collection.get({
      include: ['documents', 'metadatas']
    });
    
    const allDocs = [];
    if (results.documents) {
      for (let i = 0; i < results.documents.length; i++) {
        try {
          const doc = JSON.parse(results.documents[i]);
          allDocs.push(doc);
        } catch (parseError) {
          console.error('解析组件文档失败:', parseError.message);
        }
      }
    }
    
    return allDocs;
  }
  
  /**
   * 清空组件文档集合
   */
  static async clearComponentDocs() {
    await this.init();
    
    const collection = await this.client.getCollection({
      name: this.COLLECTION_NAME
    });
    
    await collection.delete({
      where: {}
    });
    
    console.log('组件文档集合已清空');
  }
}
