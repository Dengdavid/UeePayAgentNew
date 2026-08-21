<template>
    <div @click="handleWrapperClick" style="max-width: 450px; width: 100%" class="date-picker-wrapper">
        <DatePicker :model-value="modelValue" placement="bottom-end" type="date" placeholder="请选择" @on-change="handleChange" :start-date="new Date(2000, 0, 1)" style="width: 100%" />
    </div>
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

const handleChange = function(value, date) {
    emits('update:modelValue', value)
    emits('on-change', value)
}

const handleWrapperClick = function() {
    emits('on-focus')
}
</script>