<template>
    <a class="text-button" href="javascript:;" :class="[type, {disabled: disabled}]" :style="{color: color}"><slot></slot></a>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    type: {
        type: String,
        default: 'default'
    },
    color: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.text-button {
    color: var(--grey-color);
}
.text-button + .text-button {
    margin-left: 12px;
}
.text-button:hover {
    text-decoration: underline;
}
.text-button.primary {
    color: var(--primary-color);
}
.text-button.warning {
    color: var(--ui-color-warning);
}
.text-button.error {
    color: var(--error-color);
}
.text-button.disabled {
    color: #dadada;
    cursor: not-allowed;
}
</style>