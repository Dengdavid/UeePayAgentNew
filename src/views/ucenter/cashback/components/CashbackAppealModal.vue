<template>
    <Modal :model-value="visible" :title="$t('cashback.appeal.title')" width="500" @on-visible-change="handleVisibleChange">
        <Form :model="appealForm" :rules="appealRules" ref="appealFormRef" :label-width="100">
            <FormItem :label="$t('cashback.appeal.cashbackAmount')">
                <div style="padding: 6px 10px; background-color: #f5f5f5; border: 1px solid #dcdee2; border-radius: 4px; color: #515a6e;">
                    $ {{ record?.amount || '0.00' }}
                </div>
            </FormItem>
            <FormItem :label="$t('cashback.appeal.appealAmount')" prop="appeal_amount">
                <InputNumber
                    v-model="appealForm.appeal_amount"
                    :min="0.01"
                    :precision="2"
                    :active-change="false"
                    :placeholder="$t('cashback.appeal.appealAmountPlaceholder')"
                    style="width: 100%"
                />
            </FormItem>
            <FormItem :label="$t('cashback.appeal.appealReason')" prop="appeal_remark">
                <Input v-model="appealForm.appeal_remark" type="textarea" :rows="4" :placeholder="$t('cashback.appeal.appealReasonPlaceholder')" />
            </FormItem>
        </Form>
        <template #footer>
            <Button @click="handleCancel">{{ $t('cashback.appeal.cancel') }}</Button>
            <Button type="primary" @click="handleSubmit" :loading="loading">{{ $t('cashback.appeal.submit') }}</Button>
        </template>
    </Modal>
</template>

<script setup>
import { ref, nextTick, defineProps, defineEmits } from 'vue'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import cardApi from '@/api/card.js'
import { t } from '@/utils'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    record: {
        type: Object,
        default: () => ({})
    }
})

const emits = defineEmits(['update:visible', 'success'])

// 数据状态
const loading = ref(false)
const appealFormRef = ref()

// 申诉表单
const appealForm = ref({
    id: '',
    appeal_amount: null,
    appeal_remark: ''
})

// 申诉表单验证规则
const appealRules = {
    appeal_amount: [
        {
            validator: (rule, value, callback) => {
                if (!value || value === '' || value === null || value === undefined) {
                    callback(new Error(t('cashback.validate.appealAmountRequired')))
                } else if (value <= 0) {
                    callback(new Error(t('cashback.validate.appealAmountPositive')))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    appeal_remark: [
        { required: true, message: t('cashback.validate.appealReasonRequired'), trigger: 'blur' },
        { min: 5, message: t('cashback.validate.appealReasonMinLength'), trigger: 'blur' }
    ]
}

// 方法
const handleVisibleChange = (visible) => {
    if (visible && props.record?.id) {
        // 弹窗打开时初始化表单
        appealForm.value = {
            id: props.record.id,
            appeal_amount: null,
            appeal_remark: ''
        }
        // 重置表单验证状态
        nextTick(() => {
            appealFormRef.value && appealFormRef.value.resetFields()
        })
    }
    emits('update:visible', visible)
}

const handleCancel = () => {
    emits('update:visible', false)
}

const handleSubmit = async () => {
    // 使用表单验证
    const valid = await appealFormRef.value.validate()
    if (!valid) {
        return
    }

    loading.value = true
    try {
        await cardApi.appealCashback(appealForm.value)
        message(t('cashback.message.appealSubmitSuccess'))
        emits('update:visible', false)
        emits('success')
    } catch (error) {
        message(t('cashback.message.appealSubmitFailed'), 'error')
    } finally {
        loading.value = false
    }
}
</script>
