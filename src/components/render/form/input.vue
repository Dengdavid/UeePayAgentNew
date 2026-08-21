<template>
    <Input :model-value="modelValue" :disabled="params.disabled" clearable :placeholder="'请输入' + (params.description ? ('' + params.description) : '')" @on-change="handleChange" @on-focus="handleFocus" style="max-width: 450px;"></Input>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: [Number, String],
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

const handleChange = function(e) {
    emits('update:modelValue', e.target.value)
    emits('on-change', e.target.value)
}

const handleFocus = function() {
    emits('on-focus', props.params.fieldName)
}
</script>