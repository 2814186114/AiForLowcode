import React, { useState } from 'react';
import { Input, Button } from './index';
import APIClient from '../core/dataService/APIClient';
import { useStore } from '../core/store';

const LoginForm = ({ preview = false }) => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const store = useStore();

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await APIClient.post('/api/login', credentials);
            store.set('authToken', response.token);
            console.log('登录成功，token已存储');
            // 这里可以添加登录成功后的重定向逻辑
        } catch (err) {
            setError(err.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2>用户登录</h2>
            {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}

            <Input
                name="email"
                label="邮箱"
                value={credentials.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
                style={{ marginBottom: 15 }}
            />

            <Input
                name="password"
                label="密码"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="请输入密码"
                style={{ marginBottom: 20 }}
            />

            {preview ? (
                <Button disabled>登录表单预览</Button>
            ) : (
                <Button
                    onClick={handleLogin}
                    loading={loading}
                    disabled={loading}
                >
                    {loading ? '登录中...' : '登录'}
                </Button>
            )}
        </div>
    );
};

export default LoginForm;
