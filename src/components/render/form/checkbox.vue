<template>
    <CheckboxGroup :model-value="modelValue" @on-change="handleChange">
        <Checkbox v-for="item in params.options" :label="item.valueId" :key="item.valueId">{{ item.value }}</Checkbox>
    </CheckboxGroup>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: Array,
        default: function() {
            return []
        }
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