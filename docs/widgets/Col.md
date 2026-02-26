# Col 列布局

栅格系统的列组件，用于创建垂直布局，与 Row 组件配合使用。基于 24 栅格系统，将一行分为 24 等份。

## 何时使用

- 需要在 Row 组件中创建垂直布局时
- 当需要控制列的宽度比例时
- 需要设置列之间的偏移量时
- 需要创建响应式布局时

## 代码演示

### 基本用法

最基本的列布局用法，与 Row 组件配合使用。

```jsx
<Row gutter={16}>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>12列宽度</div>
  </Col>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>12列宽度</div>
  </Col>
</Row>
```

### 不同宽度比例

可以设置不同的 span 值，控制列的宽度比例。

```jsx
<Row gutter={16}>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>8列宽度</div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>8列宽度</div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>8列宽度</div>
  </Col>
</Row>

<Row gutter={16}>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>6列宽度</div>
  </Col>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>12列宽度</div>
  </Col>
  <Col span={6}>
    <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>6列宽度</div>
  </Col>
</Row>
```

### 偏移列

可以设置 offset 属性，控制列的偏移量。

```jsx
<Row gutter={16}>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>12列宽度</div>
  </Col>
  <Col span={12}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>12列宽度</div>
  </Col>
</Row>

<Row gutter={16}>
  <Col span={8} offset={8}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>8列宽度，偏移8列</div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>8列宽度</div>
  </Col>
</Row>

<Row gutter={16}>
  <Col span={6} offset={6}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>6列宽度，偏移6列</div>
  </Col>
  <Col span={6} offset={6}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>6列宽度，偏移6列</div>
  </Col>
</Row>
```

### 嵌套列

列组件可以嵌套使用，创建复杂布局。

```jsx
<Row gutter={16}>
  <Col span={16}>
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
      <p>16列宽度</p>
      <Row gutter={8}>
        <Col span={12}>
          <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>嵌套12列</div>
        </Col>
        <Col span={12}>
          <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>嵌套12列</div>
        </Col>
      </Row>
    </div>
  </Col>
  <Col span={8}>
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>
      <p>8列宽度</p>
      <Row gutter={8}>
        <Col span={24}>
          <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>嵌套24列</div>
        </Col>
        <Col span={12}>
          <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>嵌套12列</div>
        </Col>
        <Col span={12}>
          <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>嵌套12列</div>
        </Col>
      </Row>
    </div>
  </Col>
</Row>
```

### 自定义高度

可以设置列的自定义高度。

```jsx
<Row gutter={16} align="middle">
  <Col span={8} height="100px">
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>高度100px</div>
  </Col>
  <Col span={8} height="150px">
    <div style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>高度150px</div>
  </Col>
  <Col span={8} height="200px">
    <div style={{ padding: '10px', backgroundColor: '#d0d0d0' }}>高度200px</div>
  </Col>
</Row>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| span | 列宽，1-24的整数，代表24等分中的占比 | number | `24` |
| offset | 列偏移量，1-24的整数，代表24等分中的偏移量 | number | `0` |
| height | 列高 | string | `'auto'` |
| width | 列宽 | string | - |
| id | 组件唯一标识 | string | - |
| children | 子组件 | ReactNode | - |

## 注意事项

1. Col 组件必须与 Row 组件配合使用，不能单独使用。
2. span 属性的取值范围是 1-24，代表 24 等分中的占比。
3. offset 属性表示列的偏移量，相当于左侧留白的列数。
4. 在设计模式下，Col 组件支持拖拽和放置组件。
5. 当鼠标悬停在列上时，会显示边框高亮，指示可以放置组件。
6. Col 组件的高度默认由内容决定，也可以通过 height 属性自定义。
7. 栅格系统基于 flex 布局实现，具有良好的响应式特性。
