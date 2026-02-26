const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

// 简单用户数据库（内存存储）
let users = [];

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 用户注册端点
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    console.log(`收到注册请求: ${username}, ${email}`);

    // 简单验证
    if (!username || !email || !password) {
        return res.status(400).json({ error: '缺少必填字段' });
    }

    // 检查邮箱是否已注册
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: '邮箱已注册' });
    }

    // 密码加密
    const hashedPassword = bcrypt.hashSync(password, 10);
    // 创建用户
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword, // 存储加密后密码
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    console.log(`用户注册成功: ${newUser.id}`);

    res.status(201).json({ success: true, userId: newUser.id });
});

// 用户登录端点
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`收到登录请求: ${email}`);

    // 简单验证
    if (!email || !password) {
        return res.status(400).json({ error: '邮箱和密码必填' });
    }

    // 查找用户
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: '用户不存在' });
    }

    // 验证密码
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: '密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        'your_secret_key', // 实际应用中应使用环境变量
        { expiresIn: '1h' }
    );

    res.status(200).json({ token });
});

// AI生成Schema端点
app.post('/ai/generate-schema', (req, res) => {
    const { prompt } = req.body;
    console.log(`收到AI生成请求: ${prompt}`);

    // 根据提示生成不同的Schema
    let schema = {};

    if (prompt.includes('表单')) {
        schema = {
            type: 'object',
            properties: {
                name: { type: 'string', title: '姓名' },
                email: { type: 'string', title: '邮箱', format: 'email' },
                phone: { type: 'string', title: '手机号', pattern: '^1[3-9]\\d{9}$' }
            },
            required: ['name', 'email']
        };
    } else if (prompt.includes('产品')) {
        schema = {
            type: 'object',
            properties: {
                name: { type: 'string', title: '产品名称' },
                price: { type: 'number', title: '价格', minimum: 0 },
                description: { type: 'string', title: '描述' }
            },
            required: ['name', 'price']
        };
    } else if (prompt.includes('用户注册')) {
        // 用户注册表单的专门处理
        schema = {
            componentType: 'Form',
            children: [
                {
                    componentType: 'Input',
                    props: { name: 'username', label: '用户名', required: true }
                },
                {
                    componentType: 'Input',
                    props: { name: 'email', label: '邮箱', type: 'email', required: true }
                },
                {
                    componentType: 'Input',
                    props: { name: 'password', label: '密码', type: 'password', required: true }
                },
                {
                    componentType: 'Button',
                    props: {
                        type: 'primary',
                        children: '注册',
                        onClickAction: {
                            type: 'api',
                            endpoint: '/api/register',
                            method: 'POST'
                        }
                    }
                }
            ]
        };
    } else if (prompt.includes('登录')) {
        // 登录表单的专门处理
        schema = {
            componentType: 'Form',
            children: [
                {
                    componentType: 'Input',
                    props: { name: 'email', label: '邮箱', type: 'email', required: true }
                },
                {
                    componentType: 'Input',
                    props: { name: 'password', label: '密码', type: 'password', required: true }
                },
                {
                    componentType: 'Button',
                    props: {
                        type: 'primary',
                        children: '登录',
                        onClickAction: {
                            type: 'api',
                            endpoint: '/api/login',
                            method: 'POST'
                        }
                    }
                }
            ]
        };
    } else {
        // 默认Schema
        schema = {
            type: 'object',
            properties: {
                field1: { type: 'string', title: '字段1' },
                field2: { type: 'number', title: '字段2' }
            }
        };
    }

    // 根据提示生成组件配置
    let componentConfig = {};

    if (prompt.includes('按钮')) {
        const buttonText = prompt.match(/文字为['"](.+?)['"]/) || prompt.match(/文字为(.+?)\s/);
        const buttonColor = prompt.includes('蓝色') ? '#1890ff' :
            prompt.includes('红色') ? '#ff4d4f' :
                prompt.includes('绿色') ? '#52c41a' : '#f0f0f0';

        componentConfig = {
            componentType: 'Button',
            props: {
                type: 'primary',
                style: { backgroundColor: buttonColor },
                children: buttonText ? buttonText[1] : '按钮'
            }
        };
    } else if (prompt.includes('输入框')) {
        componentConfig = {
            componentType: 'Input',
            props: {
                placeholder: prompt.includes('搜索') ? '请输入搜索内容' : '请输入'
            }
        };
    } else if (prompt.includes('表单')) {
        // 返回更复杂的表单结构
        componentConfig = {
            componentType: 'Form',
            props: {
                layout: 'vertical'
            },
            children: [
                { componentType: 'Input', props: { name: 'field1', label: '字段1' } },
                { componentType: 'Input', props: { name: 'field2', label: '字段2' } },
                { componentType: 'Button', props: { children: '提交' } }
            ]
        };
    } else {
        // 默认返回按钮组件
        componentConfig = {
            componentType: 'Button',
            props: {
                children: '点击我'
            }
        };
    }

    console.log('AI生成响应:', componentConfig);

    // 模拟AI处理延迟
    setTimeout(() => {
        res.json(componentConfig);
    }, 1500);
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务运行在 http://localhost:${port}`);
    console.log(`可用端点：`);
    console.log(`- POST /api/register : 用户注册`);
    console.log(`- POST /ai/generate-schema : AI生成组件`);
});
