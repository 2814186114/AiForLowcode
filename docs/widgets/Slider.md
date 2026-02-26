# Slider 滑块

滑块组件，用于在指定范围内选择数值。

## 何时使用

- 需要在一定范围内选择数值时。
- 需要直观地展示当前值与范围的关系时。
- 适合用于音量调节、亮度控制、进度显示等场景。
- 需要用户进行连续值选择时。

## 代码演示

### 基本用法

最基本的滑块用法，范围为0-100。

```jsx
<Slider />
```

### 自定义范围

可以自定义滑块的最小值和最大值。

```jsx
<Slider min={0} max={200} />
```

### 默认值

设置滑块的初始值。

```jsx
<Slider min={0} max={100} defaultValue={30} />
```

### 实时反馈

滑块值变化时触发回调函数，用于实时更新数据。

```jsx
import React, { useState } from 'react';

function SliderDemo() {
  const [value, setValue] = useState(50);
  
  return (
    <div>
      <Slider 
        min={0} 
        max={100} 
        defaultValue={value}
        onChange={setValue}
      />
      <p style={{ marginTop: '10px' }}>当前值：{value}</p>
    </div>
  );
}
```

### 温度调节示例

在实际场景中使用滑块，如温度调节。

```jsx
import React, { useState } from 'react';

function TemperatureControl() {
  const [temperature, setTemperature] = useState(22);
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <h3>温度调节</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span>16°C</span>
        <span>{temperature}°C</span>
        <span>30°C</span>
      </div>
      <Slider 
        min={16} 
        max={30} 
        defaultValue={temperature}
        onChange={setTemperature}
      />
      <div style={{ marginTop: '20px' }}>
        <p>当前设定温度：{temperature}°C</p>
        <p>{temperature < 20 ? '温度较低，建议开启暖气' : temperature > 25 ? '温度较高，建议开启空调' : '温度适中'}</p>
      </div>
    </div>
  );
}
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| min | 滑块的最小值 | number | `0` |
| max | 滑块的最大值 | number | `100` |
| defaultValue | 滑块的初始值 | number | `50` |
| onChange | 滑块值变化时的回调函数 | function | `() => { }` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| onChange | 滑块值变化时触发 | `(value: number) => void` |

## 注意事项

1. 滑块在设计模式下（mode='design'）是只读的，仅可拖拽。
2. 在预览模式下（mode='preview'）可以正常拖动调整数值。
3. 滑块值变化时，会触发onChange事件，并将当前数值作为参数传递。
4. 预览模式下会显示当前滑块值，设计模式下不显示。
5. 滑块支持键盘操作，可以通过左右箭头键微调数值。
