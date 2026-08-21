<template>
    <div class="ui-loading">
        <div class="ui-loading-item" :class="[type]" :style="{backgroundColor}"></div>
        <div class="ui-loading-item" :class="[type]" :style="{backgroundColor}"></div>
        <div class="ui-loading-item" :class="[type]" :style="{backgroundColor}"></div>
    </div>
</template>

<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'rect' // rect/dot
    },
    backgroundColor: {
        type: String,
        default: '#b1b1b1'
    }
})
</script>

<style>
.ui-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--ui-size-18);
    gap: 5px;
}
.ui-loading-item {
    position: relative;
}

.ui-loading-item.rect {
    width: var(--ui-size-3);
    height: var(--ui-size-2);
    animation: uiRectLoading 0.8s infinite linear alternate;
    animation-delay: .4s;
}
.ui-loading-item.rect:first-child {
    animation: uiRectLoading 0.8s infinite alternate;
    animation-delay: 0s
}

.ui-loading-item.rect:last-child {
    animation: uiRectLoading 0.8s infinite alternate;
    animation-delay: 0.8s
}

.ui-loading-item.dot {
    width: var(--ui-size-4);
    height: var(--ui-size-4);
    border-radius: var(--ui-radius-circle);
    animation: uiDotLoading 0.8s infinite linear alternate;
    animation-delay: .4s;
}
.ui-loading-item.dot:first-child {
    animation: uiDotLoading 0.8s infinite alternate;
    animation-delay: 0s
}

.ui-loading-item.dot:last-child {
    animation: uiDotLoading 0.8s infinite alternate;
    animation-delay: 0.8s
}

@keyframes uiRectLoading {
    0% {
        height: 100%;
        opacity: 1;
    }

    100% {
        height: var(--ui-size-2);
        opacity: 0.2;
    }
}

@keyframes uiDotLoading {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0.2;
    }
}
</style>
