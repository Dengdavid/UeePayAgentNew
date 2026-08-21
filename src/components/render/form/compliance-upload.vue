<!-- 合规资料上传 -->
<template>
    <div class="render-upload">
        <div class="render-upload-action" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
            <input v-if="!params.disabled" ref="fileInput" type="file" accept="image/png,image/jpeg,image/jpg"
                style="display: none;" @change="handleFileChange" @focus="handleFocus" />
            <Icon type="ios-camera-outline" size="40" />
            <p>点击上传或将图片拖拽至此释放以上传</p>
            <div v-if="modelValue && modelValue.url" class="preview">
                <img :src="modelValue.url" alt="预览图" />
                <div v-if="!params.disabled" class="delete" @click.stop="handleDelete">
                    <Icon type="md-close-circle" size="20" />
                </div>
            </div>
        </div>
        <p class="desc">支持png、jpg、jpeg格式图片，不超过 2M</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { expressApi } from '@/api'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'

// 字段名称映射
const fieldNameToRfiType = {
    // 'senderPortrait': 'senderPortrait',  // 人脸照片映射到身份证正面
    // 'senderPassport': 'passport',  // 护照映射到护照
    // 'senderIdFront': 'ic_front',   // 身份证正面
    // 'senderIdBack': 'ic_back',     // 身份证背面
    // 'senderWorkPermit': 'work_permit', // 工作许可证
    // 'senderInvoice': 'invoice',    // 发票
    // 'senderSourceOfFund': 'source_of_funds', // 资金来源
    // 'senderRelationshipProof': 'relationship_proof', // 关系证明
    // 'senderOccupation': 'occupation', // 职业
    // 'senderFullNativeName': 'full_native_name', // 完整的母语姓名
    // 'senderIdNumber': 'id_number'  // 身份证件号码
}

const props = defineProps({
    modelValue: {
        type: [String, Object],
        default: () => ({
            url: '',
            fileId: ''
        })
    },
    params: {
        type: Object,
        default: () => ({})
    }
})

const emits = defineEmits(['update:modelValue', 'on-change', 'on-focus'])
const fileInput = ref(null)

// 触发文件选择
const triggerUpload = () => {
    if (props.params.disabled) return false;
    if (!props.modelValue.url) {
        fileInput.value.click()
        // 触发聚焦事件
        handleFocus()
    }
}

// 处理字段聚焦
const handleFocus = () => {
    emits('on-focus')
}

// 处理文件拖放
const handleDrop = (e) => {
    if (props.params.disabled) return false;
    if (props.modelValue.url) return
    const file = e.dataTransfer.files[0]
    if (file) {
        uploadFile(file)
    }
    // 触发聚焦事件
    handleFocus()
}

// 处理文件选择
const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        uploadFile(file)
    }
    // 清空 input 的值，这样同一个文件可以重复选择
    e.target.value = ''
}

// 上传文件
const uploadFile = async (file) => {
    // 检查文件类型
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        message('只支持 PNG、JPG、JPEG 格式的图片', 'error')
        return
    }

    // 检查文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
        message('图片大小不能超过 2MB', 'error')
        return
    }

    try {
        Message.loading({
            content: '文件上传中',
            duration: 0
        });
        const formData = new FormData()
        formData.append('file', file)
        // 将 fieldName 转换为对应的 rfi_type
        const fieldName = props.params.fieldName || props.params.name || ''
        const rfiType = fieldNameToRfiType[fieldName] || fieldName
        formData.append('rfi_type', rfiType)

        const res = await expressApi.uploadComplianceFile(formData)
        destroyAllMessages()
        if (res) {
            const uploadResult = {
                url: res.fileFullUrl,
                fileId: res.fileId
            }
            emits('update:modelValue', uploadResult)
            emits('on-change', uploadResult)
            message('上传成功')
        } else {
            message(res?.message || '上传失败', 'error')
        }
    } catch (error) {
        message('上传失败，请稍后重试', 'error')
    }
}
const destroyAllMessages = () => {
    document.querySelectorAll('.ivu-message .ivu-message-notice').forEach(el => el.remove());
}
// 删除图片
const handleDelete = (e) => {
    e.stopPropagation()
    emits('update:modelValue', {
        url: '',
        fileId: ''
    })
}
</script>

<style scoped>
.render-upload {
    width: 100%;
    max-width: 450px;
}

.render-upload-action {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: var(--ui-size-200);
    color: var(--ui-color-text-muted);
    border-radius: var(--ui-radius-md);
    border: var(--ui-border-muted);
    background: rgba(248, 251, 255, 0.8);
    cursor: pointer;
    overflow: hidden;
}

.render-upload-action:hover {
    border-color: var(--ui-color-primary);
}

.render-upload-action .preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.render-upload-action .preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.render-upload-action .preview .delete {
    position: absolute;
    top: 10px;
    right: 10px;
    color: var(--ui-color-text-inverse);
    background: rgba(0, 0, 0, 0.5);
    border-radius: var(--ui-radius-circle);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.render-upload .desc {
    margin-top: 10px;
    color: var(--ui-color-text-muted);
    line-height: 1;
}
</style>
