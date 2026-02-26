# Button 按钮

按钮用于开始一个即时操作。

## 何时使用

- 响应用户点击行为，触发相应的业务逻辑。
- 需要一个交互元素来提交表单、打开对话框或执行其他操作。
- 需要多种样式的按钮来区分不同操作的重要性。

## 代码演示

### 基本用法

最基本的按钮用法。

```jsx
<Button label="按钮" />
```

### 按钮类型

按钮有三种类型：默认按钮、主要按钮和危险按钮。

```jsx
<div>
  <Button label="默认按钮" type="default" />
  <Button label="主要按钮" type="primary" />
  <Button label="危险按钮" type="danger" />
</div>
```

### 自定义颜色

可以自定义按钮的背景色和文本颜色。

```jsx
<div>
  <Button label="绿色按钮" bgColor="#52c41a" color="#fff" />
  <Button label="橙色按钮" bgColor="#fa8c16" color="#fff" />
  <Button label="紫色按钮" bgColor="#722ed1" color="#fff" />
</div>
```

### API 配置

在预览模式下，按钮可以配置 API 调用。

```jsx
<Button 
  label="调用API" 
  type="primary"
  apiConfig={{
    url: '/api/test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }}
/>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label | 按钮文本内容 | string | `'按钮'` |
| type | 按钮类型 | `'default' | 'primary' | 'danger'` | `'default'` |
| color | 按钮文本颜色 | string | - |
| bgColor | 按钮背景颜色 | string | - |
| onClick | 点击事件处理函数 | function | `() => console.log('按钮点击')` |
| apiConfig | API 配置对象，用于在预览模式下调用 API | object | `null` |
| id | 组件唯一标识，用于设计器内部状态管理 | string | - |

### apiConfig

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | API 端点 URL | string | - |
| method | 请求方法 | `'GET' | 'POST' | 'PUT' | 'DELETE'` | - |
| headers | 请求头配置 | object | - |
| params | URL 查询参数 | object | - |
| data | 请求体数据 | object | - |

## 注意事项

1. 按钮在设计模式下（mode='design'）是可拖拽的，点击事件不会触发。
2. 按钮在预览模式下（mode='preview'）可以点击，会触发 onClick 事件和 API 请求（如果配置）。
3. 点击按钮时会有一个 0.3 秒的点击状态动画。
4. API 配置只在预览模式下生效。
5. 自定义颜色时，建议同时设置 bgColor 和 color 以确保文本可读性。