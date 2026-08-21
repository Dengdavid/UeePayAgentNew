<template>
    <Drawer
        :model-value="modelValue"
        :title="title"
        :width="width"
        :closable="closable"
        :maskClosable="maskClosable"
        :mask="mask"
        :maskStyle="maskStyle"
        :styles="styles"
        :placement="placement"
        :zIndex="zIndex"
        :transfer="transfer"
        :className="className"
        :draggable="draggable"
        @on-close="handleClose"
        @on-visible-change="handleVisibleChange"
    >
        <div class="ui-fixed-drawer">
            <div class="ui-fixed-drawer--body">
                <slot></slot>
            </div>
            <div class="ui-fixed-drawer--footer">
                <slot name="footer">
                    <div class="ui-fixed-drawer--actions">
                        <div class="error-message" v-if="errorMessage">
                            <Icon type="ios-alert-outline" size="16" class="error-icon" />
                            <span>{{ errorMessage }}</span>
                        </div>
                        <div class="button-group">
                            <Button v-if="showOK" type="primary" style="min-width: 100px;" @click="handleOK">{{ okText }}</Button>
                            <Button v-if="showCancel" class="ml-10" style="min-width: 100px;" @click="handleClose">{{ cancelText }}</Button>
                        </div>
                    </div>
                </slot>
            </div>
        </div>
    </Drawer>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    width: {
        type: [Number, String],
        default: 256
    },
    closable: {
        type: Boolean,
        default: true
    },
    maskClosable: {
        type: Boolean,
        default: true
    },
    mask: {
        type: Boolean,
        default: true
    },
    maskStyle: {
        type: Object,
        default: function() {
            return {}
        }
    },
    styles: {
        type: Object,
        default: function() {
            return {}
        }
    },
    placement: {
        type: String,
        default: 'right'
    },
    zIndex: {
        type: Number,
        default: 1000
    },
    transfer: {
        type: Boolean,
        default: true
    },
    className: {
        type: String,
        default: ''
    },
    draggable: {
        type: Boolean,
        default: false
    },
    okText: {
        type: String,
        default: '确定'
    },
    cancelText: {
        type: String,
        default: '取消'
    },
    showCancel: {
        type: Boolean,
        default: true
    },
    showOK: {
        type: Boolean,
        default: true
    },
    errorMessage: {
        type: String,
        default: ''
    }
})

const emits = defineEmits(['update:modelValue', 'on-close', 'on-visible-change', 'on-submit'])

const handleClose = function() {
    emits('update:modelValue', false);
    emits('on-close')
}

const handleVisibleChange = function(e) {
    emits('on-visible-change', e)
}

const handleOK = function() {
    emits('on-submit')
}

</script>

<style scoped>
.ui-fixed-drawer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
}
.ui-fixed-drawer--body {
    flex: 1;
    min-height: 1px;
    padding: var(--ui-padding-16);
    overflow: hidden;
    overflow-y: auto;
}
.ui-fixed-drawer--footer {
    border-top: var(--ui-border-divider);
    padding: 10px 16px;
}
.ui-fixed-drawer--actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.error-message {
    color: var(--ui-color-error-strong);
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
}
.error-icon {
    color: var(--ui-color-error-strong);
}
.button-group {
    display: flex;
}
</style>
