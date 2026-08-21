<template>
    <div class="ui-bread-crumb">
        <a v-if="back" class="back-btn" href="javascript:;" @click="handleBack">
            <Icon type="ios-arrow-back" size="18" color="var(--ui-color-text)" />
            <span class="text">返回</span>
        </a>
        <div class="spacer"></div>
        <span class="title" :title="title">{{ title }}</span>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    back: {
        type: Boolean,
        default: true
    }
})

const emits = defineEmits(['on-back'])

const handleBack = function() {
    emits('on-back');
    router.back()
}
</script>

<style scoped>
.ui-bread-crumb {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    font-size: 13px;
}
.ui-bread-crumb .back-btn {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--ui-color-text);
}
.ui-bread-crumb .back-btn .text {
    margin-left: 3px;
}
.ui-bread-crumb .spacer {
    flex-shrink: 0;
    margin: var(--ui-margin-0-10);
    width: var(--ui-size-1);
    height: 13px;
    background: #D8D8D8;
}
.ui-bread-crumb .title {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--ui-color-text);
}
</style>
