// 组件类型映射表
export const componentTypeMap = {
    '按钮': 'Button',
    'Button': 'Button',
    '输入框': 'Input',
    '文本框': 'Input',
    'Input': 'Input',
    '选择器': 'Select',
    '下拉框': 'Select',
    'Select': 'Select',
    '开关': 'Switch',
    'Switch': 'Switch',
    '滑块': 'Slider',
    'Slider': 'Slider',
    '日期选择器': 'DatePicker',
    'DatePicker': 'DatePicker',
    '表单': 'Form',
    '多字段': 'Form',
    'Form': 'Form',
    '行布局': 'Row',
    'Row': 'Row',
    '列布局': 'Col',
    'Col': 'Col'
};

export const componentDefaultProps = {
    Button: {
        type: 'button',
        children: '按钮'
    },
    Input: {
        type: 'text',
        placeholder: '',
        value: ''
    },
    Select: {
        options: [],
        placeholder: '请选择'
    },
    Row: {
        gutter: 16
    },
    Col: {
        span: 12
    },
    DatePicker: {
        placeholder: '请选择日期'
    },
    Switch: {
        checked: false
    },
    Slider: {
        min: 0,
        max: 100,
        defaultValue: 30
    }
};

// 定义每个组件的可配置属性
export const componentProperties = {
    Button: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: 'auto'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        // 按钮属性
        text: {
            type: 'text',
            label: '按钮文字',
            default: '按钮'
        },
        type: {
            type: 'select',
            label: '按钮类型',
            options: ['primary', 'default', 'dashed', 'text', 'link'],
            default: 'default'
        },
        size: {
            type: 'radio',
            label: '尺寸',
            options: ['small', 'middle', 'large'],
            default: 'middle'
        },
        color: {
            type: 'color',
            label: '按钮颜色',
            default: '#1890ff'
        },
        bgColor: {
            type: 'color',
            label: '背景颜色',
            default: '#ffffff'
        }
    },
    Input: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        // 输入框属性
        placeholder: {
            type: 'text',
            label: '占位文本',
            default: '请输入'
        },
        value: {
            type: 'text',
            label: '默认值',
            default: ''
        }
    },
    Select: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        options: {
            type: 'json',
            label: '选项配置',
            default: `[
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]`
        },
        disabled: {
            type: 'switch',
            label: '禁用状态',
            default: false
        }
    },
    Switch: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: 'auto'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        // 开关属性
        checked: {
            type: 'switch',
            label: '是否开启',
            default: true
        },
        disabled: {
            type: 'switch',
            label: '禁用状态',
            default: false
        }
    },
    Slider: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        // 滑块属性
        min: {
            type: 'number',
            label: '最小值',
            default: 0,
            validate: (value) => value >= 0 || '最小值不能小于0'
        },
        max: {
            type: 'number',
            label: '最大值',
            default: 100,
            validate: (value, props) => {
                if (value <= props.min) return '最大值必须大于最小值';
                if (value > 1000) return '最大值不能超过1000';
                return true;
            }
        },
        step: {
            type: 'number',
            label: '步长',
            default: 1,
            validate: (value) => value > 0 || '步长必须大于0'
        },
        disabled: {
            type: 'switch',
            label: '禁用状态',
            default: false
        }
    },
    DatePicker: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        // 日期选择器属性
        placeholder: {
            type: 'text',
            label: '占位文本',
            default: '请选择日期'
        },
        format: {
            type: 'select',
            label: '日期格式',
            options: ['YYYY-MM-DD', 'YYYY/MM/DD', 'MM/DD/YYYY', 'DD/MM/YYYY'],
            default: 'YYYY-MM-DD'
        },
        showTime: {
            type: 'switch',
            label: '显示时间',
            default: false
        },
        disabled: {
            type: 'switch',
            label: '禁用状态',
            default: false
        }
    },
    Row: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        gutter: {
            type: 'number',
            label: '栅格间隔',
            default: 16,
            validate: (value) => value >= 0 || '间隔不能小于0'
        },
        justify: {
            type: 'select',
            label: '水平排列',
            options: ['start', 'end', 'center', 'space-around', 'space-between'],
            default: 'start'
        },
        align: {
            type: 'select',
            label: '垂直对齐',
            options: ['top', 'middle', 'bottom'],
            default: 'top'
        }
    },
    Col: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        span: {
            type: 'number',
            label: '栅格占位',
            default: 12,
            validate: (value) => (value >= 1 && value <= 24) || '必须是1-24之间的数字'
        },
        xs: {
            type: 'number',
            label: 'xs断点',
            default: null,
            validate: (value) => value === null || (value >= 1 && value <= 24) || '必须是1-24之间的数字'
        },
        sm: {
            type: 'number',
            label: 'sm断点',
            default: null,
            validate: (value) => value === null || (value >= 1 && value <= 24) || '必须是1-24之间的数字'
        },
        md: {
            type: 'number',
            label: 'md断点',
            default: null,
            validate: (value) => value === null || (value >= 1 && value <= 24) || '必须是1-24之间的数字'
        },
        lg: {
            type: 'number',
            label: 'lg断点',
            default: null,
            validate: (value) => value === null || (value >= 1 && value <= 24) || '必须是1-24之间的数字'
        }
    },
    Form: {
        // 数据绑定配置
        dataSource: {
            type: 'json',
            label: '数据绑定配置',
            default: '{}',
            hidden: true
        },
        // 布局属性
        width: {
            type: 'text',
            label: '宽度',
            default: '100%'
        },
        height: {
            type: 'text',
            label: '高度',
            default: 'auto'
        },
        title: {
            type: 'string',
            label: '表单标题'
        },
        fields: {
            type: 'array',
            label: '表单字段',
            itemType: {
                name: { type: 'string', label: '字段名' },
                type: {
                    type: 'select',
                    label: '字段类型',
                    options: ['text', 'email', 'password', 'number', 'date']
                },
                required: { type: 'boolean', label: '必填' }
            }
        },
        submitText: {
            type: 'string',
            label: '提交按钮文本'
        }
    }
};
