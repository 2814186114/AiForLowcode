# Select 选择器

下拉选择器，用于从一组选项中选择一个值。

## 何时使用

- 需要从多个选项中选择一个值时。
- 当选项数量较多，不适合使用按钮组展示时。
- 需要节省页面空间，将选项折叠显示时。

## 代码演示

### 基本用法

最基本的下拉选择器用法。

```jsx
<Select 
  options={['选项1', '选项2', '选项3']} 
/>
```

### 带默认值

设置下拉选择器的默认选中值。

```jsx
<Select 
  options={['选项1', '选项2', '选项3']} 
  defaultValue="选项2"
/>
```

### 自定义选项

使用自定义的选项列表。

```jsx
<Select 
  options={[
    '北京',
    '上海',
    '广州',
    '深圳',
    '杭州'
  ]} 
  defaultValue="北京"
/>
```

### 表单中使用

在表单中使用选择器，配合状态管理。

```jsx
import React, { useState } from 'react';

function Form() {
  const [city, setCity] = useState('北京');
  
  return (
    <div>
      <label>城市：</label>
      <Select 
        options={['北京', '上海', '广州', '深圳']} 
        defaultValue={city}
      />
    </div>
  );
}
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 选项列表 | string[] | `['选项1', '选项2', '选项3']` |
| defaultValue | 默认选中的值 | string | `''` |

## 注意事项

1. 选择器在设计模式下（mode='design'）是只读的，仅可拖拽。
2. 在预览模式下（mode='preview'）可以正常选择和交互。
3. 选择器的值变化时，会自动更新内部状态。
4. 选择器支持键盘操作，可以通过上下箭头键切换选项，Enter键确认选择。
5. 点击选择器外部区域会关闭下拉列表。
