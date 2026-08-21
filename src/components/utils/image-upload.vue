<template>
    <div @mouseover="handleMouseover" @mouseout="showUpload = false" class="ui-upload-image" :style="styles">
        <div class="ui-image" v-show="url">
            <img :src="url" />
        </div>
        <div class="ui-upload" v-show="(showUpload || !url) && !uploading">
            <Upload
                ref="upload"
                name="files"
                :accept="formatDatas"
                :action="ajaxUrl"
                :headers="headers"
                :paste="true"
                :show-upload-list="false"
                :format="format"
                :max-size="maxSize"
                :before-upload="handleBeforeUpload"
                :on-success="handleSuccess"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                :on-progress="handleProgress"
                :on-error="handleError"
                :multiple="false"
            >
                <div class="ui-upload-icon">
                    <slot>
                        <Icon type="md-camera" size="32" color="var(--ui-color-primary)"></Icon>
                        <div class="label">{{ label }}</div>
                    </slot>
                </div>
            </Upload>
        </div>
        <div class="ui-progress" v-show="uploading">
            <Progress :percent="percent" :stroke-width="5" hide-info></Progress>
        </div>
    </div>
</template>

<script setup>
import { host } from '@/config/index';
import Cookies from 'js-cookie';
import { Message, Notice } from 'view-ui-plus';
import { message } from '@/utils/message.js'
import { computed, ref } from 'vue';

const emits = defineEmits(['update:modelValue', 'update:url', 'update:id', 'on-change'])

const props = defineProps({
    width: {                                        // 组件宽度
        type: [Number, String],
        default: 60
    },
    height: {                                        // 组件宽度
        type: [Number, String],
        default: 0
    },
    label: {
        type: String,
        default: ''
    },
    format: {                                        // 图片格式
        type: Array,
        default: function() {
            return ['jpg','jpeg','png'];
        }
    },
    maxSize: {                                        // 图片大小限制，KB为单位
        type: Number,
        default: 2048
    },
    banUpload: {                                    // 禁止上传，只做展示
        type: Boolean,
        default: false
    },
    modelValue: {                                        // 默认图片地址
        type: [Number, String],
        default: ''
    },
    id: {                                        // 文件ID
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    }
})

const showUpload = ref(false);
const uploading = ref(false);
const ajaxUrl = ref(host + '/vcc/upload');
const percent = ref(0)

const headers = {
    token: Cookies.get('token')
}

const formatDatas = computed(() => {
    const formats = props.format.map(item => '.' + item);
    return formats.join(',');
})
const styles = computed(() => {
    let obj = {
        width: props.width +'px',
        height: props.height +'px'
    }
    if(typeof props.width === 'string') {
        obj.width = props.width;
    }
    if(!props.height) {
        obj.height = obj.width;
    }else{
        if(typeof props.height === 'string') {
            obj.height = props.height;
        }
    }
    return obj;
})

const handleSuccess = function(res, file, fileList) {
    percent.value = 100;
    if(res.code === 1) {
        // 新格式
        emits('update:id', res.data.fileId);
        emits('update:modelValue', res.data.fileId);
        emits('update:url', res.data.fileFullUrl);

        // emits('update:url', res.data.real_url);
        emits('on-change', res.data);
    }else {
        emits('update:url', '');
        handleError();
    }
    setTimeout(() => {
        uploading.value = false;
        percent.value = 0;
    }, 300)
}
const handleFormatError = function(file) {
    Notice.warning({
        title: '文件格式不正确',
        desc: file.name + ' 的格式不正确， 请选择'+ props.format.join('、') +'格式的文件。'
    });
    uploading.value = false;
    percent.value = 0;
}
const handleMaxSize = function(file) {
    // 单位换算
    let _Mb = props.maxSize / 1024;
    let f = _Mb.toString().split(".");
    if(f.length > 1) {
        _Mb = f[0] + '.' + f[1].substring(0, 2);
    }
    Notice.warning({
        title: '超出文件大小限制',
        desc: file.name + ' 文件太大了， 请选择'+ _Mb +'M以内的文件。'
    });
    percent.value = 0;
    uploading.value = false;
}
const handleBeforeUpload = function(file) {
    percent.value = 0;
    uploading.value = true;
    if (file && file.type.startsWith('image/')) {
        // 创建FileReader对象
        const reader = new FileReader();
        // 当文件读取完成时
        reader.onload = function(e) {
            // 设置图像预览元素的src属性为读取到的文件内容（base64编码）
            emits('update:url', e.target.result);
        };
        // 读取文件内容为DataURL（base64编码）
        reader.readAsDataURL(file);
    }
}
const handleProgress = function(event, file, fileList) {
    percent.value = file.percentage;
}
const handleMouseover = function() {
    if(!uploading.value && !props.banUpload){
        showUpload.value = true;
    }
}
const handleError = function() {
    message('上传失败', 'error');
    percent.value = 0;
    uploading.value = false;
}

</script>

<style>
.ui-upload-image {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    border-radius: var(--ui-radius-md);
    background-color: #eff6ff;
    vertical-align: top;
    overflow: hidden;
    cursor: pointer;
}
.ui-upload-image:hover {
    border-color: #2d8cf0;
}
.ui-upload-image .ui-image {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    z-index: 1;
}
.ui-upload-image .ui-image img {
    max-width: 100%;
    max-height: 100%;
}
.ui-upload-image .ui-upload, .ui-upload-image .ui-progress {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
}
.ui-upload-image .ui-progress {
    background-color: rgba(255, 255, 255, .8);
}
.ui-upload-image .ui-progress > div {
    position: absolute;
    left: 3px;
    right: 3px;
    top: 50%;
    margin-top: -5px;
    width: auto;
    line-height: 1;
}
.ui-upload-image .ui-upload > div > div {
    border: 0;
    border-radius: 0;
    background-color: transparent;
}
.ui-upload-image .ui-upload .ivu-upload {
    width: 100%;
    height: 100%;
}
.ui-upload-image .ui-upload-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.ui-upload-image .ui-upload-icon .label {
    margin-top: 5px;
    color: #b1b1b1;
}
</style>
