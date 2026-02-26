import React, { useState } from 'react';
import Toolbox from './components/Toolbox';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import PageTabs from './components/PageTabs';
import SchemaEditor from './components/SchemaEditor';
import { useStore } from './core/store';
import AIGeneratePanel from './components/AIGeneratePanel';

function App() {
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [aiHelp, setAiHelp] = useState(false)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#1890ff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>低代码平台</div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setAiHelp(!aiHelp)}
            style={{
              padding: '5px 15px',
              background: aiHelp ? '#096dd9' : '#40a9ff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >Ai辅助生成</button>
          <button
            onClick={() => setMode('design')}
            style={{
              padding: '5px 15px',
              background: mode === 'design' ? '#096dd9' : '#40a9ff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            设计模式
          </button>
          <button
            onClick={() => setMode('preview')}
            style={{
              padding: '5px 15px',
              background: mode === 'preview' ? '#096dd9' : '#40a9ff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            预览模式
          </button>
          <button
            onClick={() => setShowSchemaEditor(!showSchemaEditor)}
            style={{
              padding: '5px 15px',
              background: showSchemaEditor ? '#096dd9' : '#40a9ff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Schema编辑器
          </button>
        </div>
      </header>

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* 左侧组件库 (25%) */}
        <div style={{ width: '25%', borderRight: '1px solid #e8e8e8' }}>
          <Toolbox />
        </div>

        {/* 中间画布区域 (50%) */}
        <div style={{ width: '50%', padding: '10px', overflow: 'auto' }}>
          <PageTabs />
          <Canvas />
        </div>

        {/* 右侧属性面板 (25%) */}
        <div style={{
          width: '25%',
          borderLeft: '1px solid #e8e8e8',
          padding: '10px',
          backgroundColor: '#fafafa',
          overflow: 'auto'
        }}>
          <PropertyPanel />
        </div>
      </div>
      {/* aiHelp浮动面板 */}
      {aiHelp && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          height: '50%',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <AIGeneratePanel onClose={() => setAiHelp(false)}></AIGeneratePanel>
        </div>
      )}

      {/* Schema编辑器浮动面板 */}
      {showSchemaEditor && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          backgroundColor: 'white',
          zIndex: 1000,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '10px',
            background: '#1890ff',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>JSON Schema编辑器</div>
            <button
              onClick={() => setShowSchemaEditor(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <SchemaEditor />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
