# Row 行布局

栅格系统的行组件，用于创建水平布局，与 Col 组件配合使用。

## 何时使用

- 需要创建水平布局时
- 当需要在一行中放置多个列组件时
- 需要控制行内元素的对齐方式和间距时
- 需要支持响应式布局时

## 代码演示

### 基本用法

最基本的行布局用法，默认会自动包裹 Col 组件。

```jsx
<Row>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>列1</div>
  </Col>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>列2</div>
  </Col>
</Row>
```

### 自定义间距

可以设置行内列之间的间距。

```jsx
<Row gutter={24}>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>列1</div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>列2</div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>列3</div>
  </Col>
</Row>
```

### 对齐方式

可以设置行内元素的水平和垂直对齐方式。

```jsx
// 水平居中对齐
<Row justify="center" gutter={16}>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>列1</div>
  </Col>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>列2</div>
  </Col>
</Row>

// 垂直居中对齐
<Row align="middle" style={{ height: '100px', backgroundColor: '#f5f5f5' }}>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>列1</div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '20px', backgroundColor: '#e0e0e0' }}>列2（高度不同）</div>
  </Col>
</Row>

// 两端对齐
<Row justify="space-between" gutter={16}>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>列1</div>
  </Col>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>列2</div>
  </Col>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>列3</div>
  </Col>
</Row>
```

### 嵌套行

行组件可以嵌套使用，创建复杂布局。

```jsx
<Row gutter={16}>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>左侧区域</div>
  </Col>
  <Col span={12}>
    <Row gutter={8}>
      <Col span={12}>
        <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>右侧上半部分</div>
      </Col>
      <Col span={12}>
        <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>右侧下半部分</div>
      </Col>
    </Row>
  </Col>
</Row>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| gutter | 列之间的间距（单位：px） | number | `16` |
| justify | 水平对齐方式 | `'start' | 'end' | 'center' | 'space-around' | 'space-between'` | `'start'` |
| align | 垂直对齐方式 | `'top' | 'middle' | 'bottom'` | `'top'` |
| width | 行宽 | string | `'100%'` |
| height | 行高 | string | `'auto'` |
| id | 组件唯一标识 | string | - |
| children | 子组件，通常是 Col 组件 | ReactNode | - |

## 注意事项

1. Row 组件主要用于包裹 Col 组件，实现栅格布局。
2. 在设计模式下，Row 组件支持拖拽和调整大小。
3. 当鼠标悬停在行上时，会显示边框高亮，指示可以放置组件。
4. Row 组件的 `width` 和 `height` 属性支持 CSS 长度值。
5. `gutter` 属性控制的是列之间的间距，而非行的内外边距。
6. 嵌套使用 Row 组件时，内层 Row 会继承外层 Row 的部分样式。
