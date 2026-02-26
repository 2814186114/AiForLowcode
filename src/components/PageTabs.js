import React from 'react';
import { useStore } from '../core/store';
import { Button } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';

export default function PageTabs() {
    const pages = useStore((state) => state.pages);
    const currentPageId = useStore((state) => state.currentPageId);
    const switchPage = useStore((state) => state.switchPage);
    const addPage = useStore((state) => state.addPage);
    const removePage = useStore((state) => state.removePage);
    const exportConfig = useStore((state) => state.exportConfig);
    const importConfig = useStore((state) => state.importConfig);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                importConfig(event.target.result);
            } catch (error) {
                console.error('导入失败:', error);
                alert('配置文件格式错误，导入失败');
            }
        };
        reader.readAsText(file);
    };



    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: '#f0f2f5',
            borderBottom: '1px solid #e8e8e8',
            marginBottom: '16px'
        }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {pages.map(page => (
                    <div
                        key={page.id}
                        onClick={() => switchPage(page.id)}
                        style={{
                            padding: '6px 16px',
                            cursor: 'pointer',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            backgroundColor: currentPageId === page.id ? '#1890ff' : '#fff',
                            color: currentPageId === page.id ? '#fff' : 'rgba(0, 0, 0, 0.65)'
                        }}
                    >
                        {page.name}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', marginLeft: 'auto', gap: '8px' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        addPage();
                    }}
                    size="small"
                >
                    添加
                </Button>

                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        removePage(currentPageId);
                    }}
                    disabled={pages.length <= 1}
                    size="small"
                >
                    删除
                </Button>

                <Button
                    icon={<ExportOutlined />}
                    onClick={() => {
                        const data = exportConfig();
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `低代码配置_${new Date().toLocaleDateString()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }}
                    size="small"
                >
                    导出
                </Button>

                <Button
                    icon={<ImportOutlined />}
                    size="small"
                >
                    <label htmlFor="import-json" style={{ cursor: 'pointer' }}>
                        导入
                    </label>
                    <input
                        id="import-json"
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImport}
                    />
                </Button>


            </div>
        </div>
    );
}
