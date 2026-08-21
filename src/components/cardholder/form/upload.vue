<!-- 普通上传 -->
<template>
    <div class="render-upload">
        <ImageUpload :model-value="modelValue" v-model:url="viewUrl" :width="260" :height="150" :max-size="5120" @on-change="handleChange">
            <div class="render-upload-action">
                <Icon type="ios-camera-outline" size="40" />
                <p>点击上传或将图片拖拽至此释放以上传</p>
            </div>
        </ImageUpload>
        <p class="desc">支持png、jpg、jpeg格式图片，不超过 5M</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/utils/image-upload.vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emits = defineEmits(['update:modelValue'])

const viewUrl = ref('')

const handleChange = function(res) {
    emits('update:modelValue', res[0])
}
</script>

<style scoped>
.render-upload {
    
}
.render-upload-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--ui-color-text-muted);
    border-radius: var(--ui-radius-md);
    border: var(--ui-border-muted);
    background: rgba(248, 251, 255, 0.8);
}
.render-upload .desc {
    margin-top: 10px;
    color: var(--ui-color-text-muted);
    line-height: 1;
}
</style>