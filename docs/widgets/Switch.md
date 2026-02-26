# Switch 开关

开关选择器，用于在开启和关闭状态之间切换。

## 何时使用

- 需要在两种状态之间切换时，如启用/禁用、显示/隐藏等。
- 当需要表示开关状态而非选择状态时。
- 适合用于配置项或设置页面。

## 代码演示

### 基本用法

最基本的开关用法。

```jsx
<Switch />
```

### 默认开启

设置开关的默认状态为开启。

```jsx
<Switch checked={true} />
```

### 自定义回调

开关状态变化时触发回调函数。

```jsx
<Switch 
  onChange={(checked) => {
    console.log('开关状态:', checked ? '开启' : '关闭');
  }} 
/>
```

### 表单中使用

在表单中使用开关，配合状态管理。

```jsx
import React, { useState } from 'react';

function Form() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  return (
    <div>
      <label>启用功能：</label>
      <Switch 
        checked={isEnabled}
        onChange={setIsEnabled}
      />
      <p>{isEnabled ? '功能已启用' : '功能已禁用'}</p>
    </div>
  );
}
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checked | 开关的初始状态 | boolean | `false` |
| onChange | 开关状态变化时的回调函数 | function | `() => { }` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| onChange | 开关状态变化时触发 | `(checked: boolean) => void` |

## 注意事项

1. 开关在设计模式下（mode='design'）是只读的，仅可拖拽。
2. 在预览模式下（mode='preview'）可以正常点击切换状态。
3. 开关状态变化时，会触发onChange事件，并将当前状态（布尔值）作为参数传递。
4. 开关显示状态文本（"开"或"关"），可根据状态自动切换。
5. 开关样式支持平滑过渡动画。
