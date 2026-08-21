<template>
    <Select 
        v-model="innerValue" 
        placeholder="请选择" 
        @on-change="handleChange"
        @on-open-change="handleFocus"
        style="max-width: 450px;"
        filterable
        clearable
        :disabled="params.disabled"
    >
        <Option 
            v-for="item in normalizedOptions" 
            :value="getOptionValue(item)" 
            :key="getOptionValue(item)"
            :disabled="item.disabled"
            style="max-width: 400px;"
        >
            {{ getOptionLabel(item) }}
            <span v-if="item.status !== 1 && item.statusText" style="margin-left: 8px; color: #999;">({{ item.statusText }})</span>
        </Option>
    </Select>
</template>

<script setup>
import { watch, onMounted, computed, getCurrentInstance, nextTick, ref } from 'vue'

const props = defineProps({
    modelValue: {
        type: [Number, String, null],
        default: null
    },
    params: {
        type: Object,
        default: function() {
            return {}
        }
    }
})

const emits = defineEmits(['update:modelValue', 'on-change', 'on-focus'])

// 添加内部值引用
const innerValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
    innerValue.value = newVal !== null ? String(newVal) : null;
});

// 规范化选项数据
const normalizedOptions = computed(() => {
    if (props.params.fieldName == 'transferType' || props.params.fieldName == 'payoutMethod') {
        // TODO::隐藏当前组件
    }

    if (!Array.isArray(props.params.options)) {
        return [];
    }
    const listData = props.params.options.map(option => {
        if (option.valueId !== undefined) {
            return {
                ...option,
                valueId: String(option.valueId),
                value: String(option.value || option.label || option.valueId),
                disabled: option.disabled || false
            };
        }
        return {
            valueId: String(option.value),
            value: String(option.label || option.value),
            disabled: option.disabled || false
        };
    });

    return listData;
});

// 获取选项的值
const getOptionValue = (option) => {
    // 强制转换为字符串类型
    const value = option.valueId !== undefined ? option.valueId : option.value;
    return String(value);
}

// 获取选项的标签
const getOptionLabel = (option) => {
    // 如果有 label（备注），加上【】包裹
    const label = option.label ? `【${option.label}】` : '';
    return `${option.first_name || ''} ${option.last_name || ''} ${label}`.trim() || option.value;
}

// 处理变更事件
const handleChange = (value) => {
    // 确保发送字符串类型的值
    const finalValue = typeof value === 'object' ? value.value : value;
    innerValue.value = String(finalValue);
    emits('update:modelValue', String(finalValue));
    emits('on-change', String(finalValue))
}

// 处理焦点事件
const handleFocus = (status) => {
    if (status) { // 只在下拉框打开时触发
        emits('on-focus', props.params.fieldName)
    }
}
</script>