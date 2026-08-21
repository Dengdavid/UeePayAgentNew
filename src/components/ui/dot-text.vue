<template>
    <div class="dot-text" :style="{color: color}">
        <span class="dot" :style="{backgroundColor: color}"></span>
        <slot></slot>
        <Tooltip v-if="tip" placement="top">
            <Icon custom="iconfont icon-question" class="ui-text-grey ml-10"></Icon>
            <template #content>
                <p style="white-space: normal;">{{ tip }}</p>
            </template>
        </Tooltip>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    color: {
        type: String,
        default: 'var(--ui-color-text)'
    },
    tip: {
        type: String,
        default: ''
    }
})
</script>

<style scoped>
.dot-text {
    display: flex;
    align-items: center;
}
.dot-text .dot {
    flex-shrink: 0;
    margin-right: 4px;
    width: 8px;
    height: var(--ui-size-8);
    border-radius: var(--ui-radius-circle);
}
</style>
