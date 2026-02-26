# DatePicker 日期选择器

日期选择器组件，用于选择日期或日期时间。

## 何时使用

- 需要选择日期或日期时间时。
- 表单中需要用户输入日期信息时。
- 日历相关功能需要选择特定日期时。
- 需要支持日期和时间一起选择时。

## 代码演示

### 基本用法

最基本的日期选择器。

```jsx
<DatePicker />
```

### 带时间选择

同时选择日期和时间。

```jsx
<DatePicker showTime={true} />
```

### 自定义占位符

设置自定义的占位文本。

```jsx
<DatePicker placeholder="请选择生日" />
```

### 默认值

设置日期选择器的默认值。

```jsx
<DatePicker value="2023-12-25" />
```

### 日期时间选择

同时选择日期和时间，并设置默认值。

```jsx
<DatePicker 
  showTime={true} 
  value="2023-12-25T14:30" 
  placeholder="请选择会议时间" 
/>
```

### 表单中使用

在表单中使用日期选择器，配合状态管理。

```jsx
import React, { useState } from 'react';

function Form() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <h3>活动时间设置</h3>
      <div style={{ marginBottom: '15px' }}>
        <label>开始时间：</label>
        <DatePicker 
          showTime={true} 
          value={startDate}
          onChange={setStartDate}
          placeholder="请选择开始时间" 
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>结束时间：</label>
        <DatePicker 
          showTime={true} 
          value={endDate}
          onChange={setEndDate}
          placeholder="请选择结束时间" 
        />
      </div>
      {startDate && endDate && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
          <p>活动时间范围：</p>
          <p>从 {startDate} 到 {endDate}</p>
        </div>
      )}
    </div>
  );
}
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| placeholder | 输入框占位文本 | string | `'请选择日期'` |
| format | 日期格式，暂时未实现自定义格式 | string | `'YYYY-MM-DD'` |
| showTime | 是否显示时间选择 | boolean | `false` |
| value | 默认值 | string | `''` |
| onChange | 日期变化时的回调函数 | function | `() => { }` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| onChange | 日期或时间变化时触发 | `(value: string) => void` |

## 注意事项

1. 日期选择器在设计模式下（mode='design'）是只读的，仅可拖拽。
2. 在预览模式下（mode='preview'）可以正常选择日期和时间。
3. 当 `showTime` 为 `true` 时，会显示日期时间选择器，否则只显示日期选择器。
4. 日期值格式：
   - 仅日期：`YYYY-MM-DD`（如：2023-12-25）
   - 日期时间：`YYYY-MM-DDTHH:MM`（如：2023-12-25T14:30）
5. 浏览器兼容性：不同浏览器对日期时间输入控件的支持程度不同，部分浏览器可能显示为普通文本输入框。
6. 目前组件的 `format` 属性仅作为标记，实际显示格式由浏览器决定。
