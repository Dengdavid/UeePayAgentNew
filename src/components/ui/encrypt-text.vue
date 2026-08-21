<template>
    <div class="encrypt-text">
        <div class="text">{{ realValue }}</div>
        <div v-if="loading" class="encrypt-btn td-btn">
            <Icon type="ios-loading" color="var(--ui-color-text-muted)" :size="16" class="loading-icon" />
        </div>
        <div v-else-if="show && copy" class="encrypt-btn td-btn show" @click="handleCopy">
            <Icon type="md-copy" color="var(--ui-color-text-muted)" :size="16" />
        </div>
        <div v-else class="encrypt-btn td-btn" :class="{show: show}" @click="handleSwitch">
            <Icon :custom="'iconfont icon-eye' + (show ? '' : '-close')" color="var(--ui-color-text-muted)"></Icon>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue'
import { Copy } from 'view-ui-plus'

const props = defineProps({
    value: {
        type: [String, Number],
        default: ''
    },
    starMaxLength: {
        type: Number,
        default: 3
    },
    copy: {
        type: Boolean,
        default: false
    },
    encrypt: {
        type: Boolean,
        default: true
    },
    visible: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    controlled: {
        type: Boolean,
        default: false
    }
})

const emits = defineEmits(['on-change'])

const show = ref(!props.encrypt);

const realValue = computed(() => {
    if(props.encrypt && !show.value) {
        const str = props.value.replace(/[^\s]/g, '*');
        if(props.starMaxLength && str.length > props.starMaxLength) {
            return str.substring(0, props.starMaxLength);
        }
        return str;
    }
    return props.value;
})

const handleCopy = function() {
    Copy({text: props.value});
}

const handleSwitch = function() {
    const nextShow = !show.value;
    if(!props.controlled) show.value = nextShow;
    emits('on-change', nextShow);
}

watch(() => props.visible, (newval) => {
    show.value = newval;
})
</script>

<style scoped>
.encrypt-text {
    display: flex;
    align-items: center;
}
.encrypt-text > div {
    flex-shrink: 0;
}
.encrypt-text .text {
    flex: 1;
}
.encrypt-text .encrypt-btn {
    margin-left: 10px;
    cursor: pointer;
}
.loading-icon {
    animation: loading-rotate var(--ui-loading-spin-duration) var(--ui-ease-linear) infinite;
}
@keyframes loading-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
