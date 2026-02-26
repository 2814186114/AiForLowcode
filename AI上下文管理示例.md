# AI上下文管理系统 - 工作流程示例

## 1. 示例场景描述

**用户需求**：
用户正在构建一个登录页面，首先输入：
> "我需要一个登录按钮"

然后继续补充需求：
> "按钮要红色的，点击时要显示加载状态，并且调用登录API"

## 2. 完整处理流程

### 2.1 第一轮对话处理

#### 步骤1：用户输入需求
```javascript
const userInput = "我需要一个登录按钮";
const sessionId = "session_123456";
const contextHistory = []; // 首次对话，上下文为空
```

#### 步骤2：调用AI客户端处理
```javascript
// 调用AI生成Schema
const result = await generateSchema(userInput, sessionId, contextHistory);
```

#### 步骤3：意图识别
```javascript
// intentRecognizer.js
// 识别用户意图
const intent = await IntentRecognizer.recognizeIntent(userInput);
// 识别结果："创建组件"
```

#### 步骤4：向量检索
```javascript
// vectorRetriever.js
// 检索相关组件文档
const relevantDocs = await VectorRetriever.retrieveRelevantDocs(userInput, topK = 3);
// 检索结果：
// [
//   {
//     type: "Button",
//     summary: "按钮组件，用于触发用户交互操作",
//     keyProperties: ["label", "type", "onClick", "apiConfig", "disabled", "loading"],
//     example: {...}
//   }
// ]
```

#### 步骤5：上下文压缩
```javascript
// contextCompressor.js
// 压缩上下文（首次对话，无历史）
const contextSummary = await ContextCompressor.generateContextSummary(contextHistory);
// 结果：""
```

#### 步骤6：构建优化Prompt
```javascript
// 构建完整Prompt
let fullPrompt = `用户需求：我需要一个登录按钮`;

// 添加上下文摘要（首次对话为空）

// 添加相关组件文档
fullPrompt += `

相关组件参考：

## Button
按钮组件，用于触发用户交互操作

关键属性：label, type, onClick, apiConfig, disabled, loading

示例：{"componentType":"Button","props":{"label":"提交","type":"primary","onClick":"submitForm","disabled":false,"loading":false}}`;

// 添加格式要求
fullPrompt += `

请严格按照以下格式生成JSON Schema：
{
  "componentType": "组件类型",
  "props": {
    // 组件属性
  }
}`;
```

#### 步骤7：调用AI API生成Schema
```javascript
// 调用DeepSeek API
const aiResponse = await callAIAPI(fullPrompt);
// AI生成结果：
// {
//   "componentType": "Button",
//   "props": {
//     "label": "登录",
//     "type": "primary",
//     "onClick": "handleLogin",
//     "apiConfig": null,
//     "disabled": false,
//     "loading": false
//   }
// }
```

#### 步骤8：处理生成结果
```javascript
// 验证Schema格式
validateSchema(aiResponse);

// 更新AI上下文
updateAIContext(userInput, aiResponse);

// 将组件添加到画布
addComponent(aiResponse);
```

### 2.2 第二轮对话处理

#### 步骤1：用户输入补充需求
```javascript
const userInput2 = "按钮要红色的，点击时要显示加载状态，并且调用登录API";
const sessionId = "session_123456";
// 获取第一轮对话后的上下文
const contextHistory = [
  {
    userInput: "我需要一个登录按钮",
    schema: {
      componentType: "Button",
      props: {
        label: "登录",
        type: "primary",
        onClick: "handleLogin",
        apiConfig: null,
        disabled: false,
        loading: false
      }
    }
  }
];
```

#### 步骤2：调用AI客户端处理
```javascript
// 调用AI生成Schema
const result2 = await generateSchema(userInput2, sessionId, contextHistory);
```

#### 步骤3：意图识别
```javascript
// intentRecognizer.js
// 识别用户意图
const intent2 = await IntentRecognizer.recognizeIntent(userInput2);
// 识别结果："配置组件"
```

#### 步骤4：向量检索
```javascript
// vectorRetriever.js
// 检索相关组件文档（更精确，因为有上下文）
const relevantDocs2 = await VectorRetriever.retrieveRelevantDocs(userInput2, topK = 3);
// 检索结果：
// [
//   {
//     type: "Button",
//     summary: "按钮组件，用于触发用户交互操作",
//     keyProperties: ["label", "type", "onClick", "apiConfig", "disabled", "loading", "style"],
//     example: {...}
//   },
//   {
//     type: "LoginForm",
//     summary: "登录表单组件，用于用户登录功能",
//     keyProperties: ["preview"],
//     example: {...}
//   }
// ]
```

#### 步骤5：上下文压缩
```javascript
// contextCompressor.js
// 生成上下文摘要
const contextSummary2 = await ContextCompressor.generateContextSummary(contextHistory);
// 生成结果："用户已创建了一个登录按钮，现在需要对其进行配置。"
```

#### 步骤6：构建优化Prompt
```javascript
// 构建完整Prompt
let fullPrompt2 = `用户需求：按钮要红色的，点击时要显示加载状态，并且调用登录API`;

// 添加上下文摘要
fullPrompt2 = `用户已创建了一个登录按钮，现在需要对其进行配置。\n\n` + fullPrompt2;

// 添加相关组件文档（仅Button组件，因为意图是配置现有按钮）
fullPrompt2 += `

相关组件参考：

## Button
按钮组件，用于触发用户交互操作

关键属性：label, type, onClick, apiConfig, disabled, loading, style

示例：{"componentType":"Button","props":{"label":"提交","type":"primary","onClick":"submitForm","disabled":false,"loading":false}}`;

// 添加格式要求
fullPrompt2 += `

请严格按照以下格式生成JSON Schema：
{
  "componentType": "组件类型",
  "props": {
    // 组件属性
  }
}`;
```

#### 步骤7：调用AI API生成Schema
```javascript
// 调用DeepSeek API
const aiResponse2 = await callAIAPI(fullPrompt2);
// AI生成结果：
// {
//   "componentType": "Button",
//   "props": {
//     "label": "登录",
//     "type": "primary",
//     "onClick": "handleLogin",
//     "apiConfig": {
//       "url": "/api/login",
//       "method": "POST"
//     },
//     "disabled": false,
//     "loading": false,
//     "style": {
//       "backgroundColor": "#ff4d4f",
//       "borderColor": "#ff4d4f"
//     }
//   }
// }
```

#### 步骤8：处理生成结果
```javascript
// 验证Schema格式
validateSchema(aiResponse2);

// 更新AI上下文
updateAIContext(userInput2, aiResponse2);

// 更新现有组件的属性
updateComponentProps(selectedComponentId, aiResponse2.props);
```

## 3. 处理结果展示

### 3.1 第一轮对话结果
在画布上创建了一个基本的登录按钮组件：

```json
{
  "id": "button_7890",
  "type": "Button",
  "props": {
    "label": "登录",
    "type": "primary",
    "onClick": "handleLogin",
    "apiConfig": null,
    "disabled": false,
    "loading": false
  },
  "parentId": null,
  "childrenIds": []
}
```

### 3.2 第二轮对话结果
更新了登录按钮的属性：

```json
{
  "id": "button_7890",
  "type": "Button",
  "props": {
    "label": "登录",
    "type": "primary",
    "onClick": "handleLogin",
    "apiConfig": {
      "url": "/api/login",
      "method": "POST"
    },
    "disabled": false,
    "loading": false,
    "style": {
      "backgroundColor": "#ff4d4f",
      "borderColor": "#ff4d4f"
    }
  },
  "parentId": null,
  "childrenIds": []
}
```

## 4. 技术优势体现

### 4.1 Token消耗优化
- **无优化情况**：第二轮对话需要发送完整的历史对话（用户输入+AI输出+新需求）+ 所有组件文档
- **优化后情况**：仅发送上下文摘要（100字左右）+ 相关组件文档（仅Button组件）
- **节省比例**：约75%的Token消耗

### 4.2 上下文理解增强
- 通过上下文压缩，AI能够理解用户当前操作是对之前创建的按钮进行配置
- 意图识别从"创建组件"变为"配置组件"，更准确地匹配用户需求

### 4.3 组件文档精准匹配
- 第一轮仅检索到Button组件
- 第二轮因上下文更明确，检索到Button组件的更多属性（包括style属性）

### 4.4 生成质量提升
- 第二轮生成的Schema包含了用户要求的所有属性：
  - 红色按钮（通过style属性）
  - 加载状态（loading属性）
  - 登录API调用（apiConfig属性）

## 5. 系统稳定性保障

### 5.1 多层回退机制
- 如果意图识别失败，系统会回退到关键词匹配
- 如果向量检索失败，系统会使用默认组件文档
- 如果上下文压缩失败，系统会使用原始上下文（但限制长度）

### 5.2 错误处理
- 所有AI操作都有完整的错误捕获和日志记录
- 生成的Schema会进行严格验证，确保格式正确

## 6. 总结

通过这个示例可以看出，AI上下文管理系统能够：
1. **高效处理多轮对话**：通过上下文压缩减少Token消耗
2. **精准理解用户需求**：通过意图识别和向量检索提供最相关的信息
3. **生成高质量结果**：AI能够理解上下文，生成符合用户期望的组件配置
4. **保证系统稳定性**：多层回退机制确保在各种情况下都能正常运行

这种方式不仅提升了用户体验，还大幅降低了AI API的调用成本，是低代码平台中AI交互的理想解决方案。