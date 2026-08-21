<template>
    <div class="ui-load-error">
        <Icon type="ios-alert-outline" :size="64" color="#999" />
        <p class="title">{{ text }}</p>
        <Button v-if="buttonText" @click="handleClick">{{ buttonText }}</Button>
    </div>
</template>

<script setup>
const props = defineProps({
    text: {
        type: String,
        default: '加载失败，请重试。'
    },
    buttonText: {
        type: String,
        default: '点击加载'
    }
})
    
    
const emits = defineEmits(['click'])

const handleClick = function() {
    emits('click');
}
</script>

<style scoped>
.ui-load-error {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--ui-color-neutral-550);
    background-color: var(--ui-color-surface);
    z-index: 99;
}
.ui-load-error .title {
    margin: var(--ui-margin-5-0-20);
    font-size: 12px;
}
</style>
