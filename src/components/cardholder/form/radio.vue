<template>
    <RadioGroup :model-value="modelValue" @on-change="handleChange">
        <Radio v-for="item in params.options" :label="item.valueId" :key="item.valueId">{{ item.value }}</Radio>
    </RadioGroup>
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

const emits = defineEmits(['update:modelValue', 'on-change'])

const handleChange = function(value) {
    emits('update:modelValue', value)
    emits('on-change', value)
}
</script>