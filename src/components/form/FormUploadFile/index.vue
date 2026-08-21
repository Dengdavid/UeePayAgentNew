<template>
  <div class="UploadImg">
    <div class="UploadImgBox">
      <FormUpload :format="format"  UploadType="file" :width="width" :height="height" v-bind="$attrs"
        @on-change="handleChange">
        <div class="dragUpload" :style="{
          width: sizeNum(width, '100%'),
          height: sizeNum(height, width),
        }">
          <template v-if="url">
            <div class="action" @click.stop>
              <Tooltip :content="$t('button.preview')" placement="top">
                <button
                  type="button"
                  class="file-action"
                  :aria-label="$t('button.preview')"
                  @click.stop.prevent="previewFiles(url)"
                >
                  <Icon type="md-eye" />
                </button>
              </Tooltip>
              <Tooltip :content="$t('button.delete')" placement="top">
                <button
                  type="button"
                  class="file-action"
                  :aria-label="$t('button.delete')"
                  @click.stop.prevent="handleChange"
                >
                  <Icon type="md-trash" />
                </button>
              </Tooltip>
            </div>
            <FormImg :width="sizeNum(width, '100%')" :height="sizeNum(height, width)" :src="url" />
          </template>
          <div class="imgBox" v-else>
            <template v-if="document">
              <FormImg :src="getImageUrl(document)" fit="cover" />
            </template>
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff" v-else></Icon>
            <p v-if="width >= 240"><span class="link">选择文件上传</span>或将文件拖拽到此处</p>
          </div>
        </div>
      </FormUpload>
      <div class="bd list-b-8">
        <TextHtml :data="tip"/>
        <template v-if="example">
          <Button type="primary" ghost size="small" v-if="isImageFile(example)" icon="md-search"
            @click="openImagePreview(example)">查看示例</Button>
          <Button type="primary" ghost size="small" v-else icon="md-download"
            @click="downloadUrls(example)">下载模版</Button>
        </template>
      </div>
    </div>
    <FormInput v-model="c_modelValue" v-show="false"></FormInput>
    <FormPup v-model="visiblePup" width="800" v-model:loading="loading" title="示例文件" :actions="pupAction">
      <div class="example-preview-list">
        <FormList :data="pupList" isBorder isCenter :height="320" :tag="(item, index) => `示例${index + 1}`">
          <template #tag="{ item, index }">
            {{ `示例${index + 1}` }}
          </template>
          <template #default="{ item, index }">
            <div class="example-preview-item">
              <Image :src="item" width="100%" height="100%" fit="contain" @click="openImagePreview(item)" />
            </div>
          </template>
        </FormList>
      </div>
    </FormPup>
    <ImagePreview v-model="visible" :preview-list="urlList" v-if="urlList.length > 0" />
  </div>
</template>

<script setup>
import TextHtml from '@/components/TextHtml/index.vue';
import { computed, defineProps, getCurrentInstance, ref } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {},
  url: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  //证件类型
  tip: {
    type: String,
  },
  //证件类型
  document: {
    type: String,
  },
  //示例
  example: {
    type: [String, Array],
    default: '',
  },
  fit: {
    type: String,
    default: 'contain',//图片适配容器模式包含：fill，contain，cover，none，scale-down
  },
})
const NATIVE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
const getType = computed(() => {
  if (!props.url) return '';
  const cleanUrl = props.url.split(/[?#]/)[0];
  const match = cleanUrl.match(/\.([^.\/]+)$/);
  return match ? match[1].toLowerCase() : '';
})
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
  },
})
const format = ref(['jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'pdf', 'xls', 'xlsx'])
const urlList = ref([])
const pupList = ref([])
const visible = ref(false)
const visiblePup = ref(false)
const loading = ref(false)
const pupAction = ref([
  // {
  //   label: '确认',
  //   click: () => {
  //     loading.value = false
  //     visiblePup.value = false
  //   }
  // }
])
const isImageFile = (fileNamesStr) => {
  if (!fileNamesStr) return false;
  // 1. 按逗号分割成文件名数组
  const fileNames = fileNamesStr.split(',');

  // 2. 检查每一个文件是否都是合法图片
  return fileNames.every(fileName => {
    // 提取扩展名：转小写，取最后一个 '.' 之后的部分
    const ext = fileName.trim().split('.').pop()?.toLowerCase();
    // 如果没有扩展名，视为非法
    if (!ext) return false;
    // 检查是否在白名单中
    return NATIVE_FORMATS.includes(ext);
  });
}
const openImagePreview = (str) => {
  if (!str) return
  if (typeof str === 'string') {
    str = str.split(',')
  }
  if (Array.isArray(str)) {
    if (str.length > 1) {
      pupList.value = str
      visiblePup.value = true
    } else {
      urlList.value = str
      visible.value = true
    }
  }
}
const getFileUrls = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}
const isNativeImageUrl = (url) => {
  const cleanUrl = String(url || '').split(/[?#]/)[0]
  const match = cleanUrl.match(/\.([^.\/]+)$/)
  return Boolean(match && NATIVE_FORMATS.includes(match[1].toLowerCase()))
}
const previewFiles = (value) => {
  const urls = getFileUrls(value)
  if (!urls.length) return
  if (urls.every(isNativeImageUrl)) {
    openImagePreview(urls)
    return
  }
  urls.forEach((url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  })
}
const getImageUrl = (name) => {
  return new URL(`../../../assets/images/document/${name}.png`, import.meta.url).href
}
const emits = defineEmits(['update:url'])
const handleChange = (res = {}) => {
  const { fileFullUrl } = res

  emits('update:url', fileFullUrl || null)
}
const downloadUrls = (str) => {
  if (!str) return
  if (typeof str === 'string') {
    str = str.split(',')
  }
  if (Array.isArray(str)) {
    str.forEach(item => {
      downloadUrl(item)
    })
  }
}
const downloadUrl = (url, filename = '') => {
  // 创建隐藏的 a 标签
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  // 设置下载文件名（可选）
  if (filename) {
    link.download = filename;
  }
  // 触发点击
  document.body.appendChild(link);
  link.click();
  // 清理 DOM
  document.body.removeChild(link);

}
const sizeNum = (val, defaultValue) => {
  let v = val ?? defaultValue

  // 如果是字符串，尝试识别为数字
  if (typeof v === 'string') {
    const trimmed = v.trim()
    // 只匹配标准十进制数（整数或小数），不支持 .5 或 12.
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed)
      if (!isNaN(num)) {
        return num + 'px'
      }
    }
    return trimmed // 返回原始字符串（如 '100%', 'auto'）
  }

  // 如果是数字
  if (typeof v === 'number' && !isNaN(v)) {
    return v + 'px'
  }

  // 兜底：转字符串或返回默认
  return v != null ? String(v) : defaultValue
}
</script>
<style lang="less" scoped>
.dragUpload {
  position: relative;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-radius: var(--ui-radius-sm);
  cursor: pointer;
  transition: border-color var(--ui-motion-slow) var(--ui-ease-soft);

  &:hover {
    background: #eff5ff;

    .action {
      display: flex;
    }
  }

  .action {
    position: absolute;
    z-index: 1;
    gap: 4px;
    top: 8px;
    right: 8px;
    display: none;
    align-items: center;

    .file-action {
      width: var(--ui-size-22);
      height: var(--ui-size-22);
      padding: 0;
      border: 0;
      border-radius: var(--ui-radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ui-color-text-inverse);
      background: rgba(0, 0, 0, 0.7);
      cursor: pointer;
      transition: background-color .2s ease;

      .ivu-icon {
        font-size: 16px;
        color: inherit;
      }

      &:hover {
        background: var(--ui-color-primary);
      }

      &:focus-visible {
        outline: 2px solid #2b5cd9;
        outline-offset: 2px;
      }
    }
  }

  .imgBox {
    padding: var(--ui-padding-20);
    display: flex;
    flex-direction: column;

    >* {
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }

    p {
      line-height: 1;
    }
  }
}

.UploadImgBox {
  display: flex;
  align-items: start;
  gap: 12px;

  .bd {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px;
  }
}
.example-preview-list{
  overflow-y: auto;
  padding-right: 4px;
}
.example-preview-item{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
