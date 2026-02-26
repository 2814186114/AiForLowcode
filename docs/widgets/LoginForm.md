# LoginForm 登录表单

登录表单组件，用于用户登录功能，包含邮箱和密码输入框以及登录按钮。

## 何时使用

- 需要实现用户登录功能时
- 作为应用的登录入口
- 需要一个标准的登录界面模板时

## 代码演示

### 基本用法

最基本的登录表单用法。

```jsx
<LoginForm />
```

### 预览模式

设置预览模式，禁用登录功能。

```jsx
<LoginForm preview={true} />
```

### 自定义样式

可以通过外层容器自定义表单样式。

```jsx
<div style={{ 
  maxWidth: '500px', 
  margin: '100px auto',
  padding: '30px',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
}}>
  <LoginForm />
</div>
```

### 集成到应用中

在应用中使用登录表单，配合路由和状态管理。

```jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {isAuthenticated ? (
            <Redirect to="/dashboard" />
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              backgroundColor: '#f5f5f5'
            }}>
              <LoginForm />
            </div>
          )}
        </Route>
        <Route path="/dashboard">
          {isAuthenticated ? (
            <Dashboard />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
      </Switch>
    </Router>
  );
}
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| preview | 是否为预览模式，预览模式下登录按钮禁用 | boolean | `false` |

## 组件结构

登录表单包含以下子组件：

1. **邮箱输入框**：用于输入用户邮箱
   - 类型：文本输入框
   - 支持即时验证
   - 占位符："请输入邮箱"

2. **密码输入框**：用于输入用户密码
   - 类型：密码输入框
   - 支持即时验证
   - 占位符："请输入密码"

3. **登录按钮**：触发登录操作
   - 支持加载状态
   - 登录中状态下禁用
   - 预览模式下显示"登录表单预览"

## 登录流程

1. 用户输入邮箱和密码
2. 点击登录按钮
3. 显示加载状态
4. 调用 API 进行登录验证
5. 登录成功：存储 token 到状态管理
6. 登录失败：显示错误信息

## 注意事项

1. 登录表单默认调用 `/api/login` 接口进行登录验证。
2. 登录成功后，会将返回的 token 存储到状态管理中。
3. 表单会显示登录过程中的加载状态和错误信息。
4. 预览模式下，登录功能被禁用，仅用于展示表单样式。
5. 表单支持响应式设计，在不同屏幕尺寸下都能正常显示。
6. 建议在实际使用中，根据项目需求修改 API 接口地址和登录逻辑。
