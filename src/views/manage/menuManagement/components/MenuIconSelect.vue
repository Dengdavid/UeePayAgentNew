<template>
  <Poptip transfer placement="bottom-start" trigger="click" :width="320" class="menu-icon-select">
    <Input
      v-model="model"
      clearable
      readonly
      :placeholder="$t('placeholder.selectPlaceholder')"
    >
      <template v-if="modelValue" #prefix>
        <IconBox :icon="modelValue" />
      </template>
    </Input>

    <template #content>
      <div class="menu-icon-select-list">
        <button
          v-for="icon in iconList"
          :key="icon"
          type="button"
          class="menu-icon-select-item"
          :class="{ active: icon === modelValue }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <IconBox :icon="icon" />
        </button>
      </div>
    </template>
  </Poptip>
</template>

<script setup>
import { computed } from 'vue'
import IconBox from '@/components/com/IconBox.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const iconList = [
  'icon-gengduoiconmorenhui',
  'icon-gonggaoiconmorenhui',
  'icon-neibuxiangmuiconmorenhui',
  'icon-shenpiiconmorenhui',
  'icon-renwuiconmorenhui',
  'icon-xiangmuiconmorenhui',
  'icon-rizhiiconmorenhui',
  'icon-zongheiconmorenhui',
  'icon-CRMEB-neirongzixun-mianxing',
  'icon-CRMEB-liebiao-mianxing',
  'icon-CRMEB-manjianmanzhe-mianxing',
  'icon-CRMEB-kefuguanli-mianxing',
  'icon-CRMEB-fenxiaoyuanshenqing-mianxing',
  'icon-CRMEB-wenjian4-mianxing',
  'icon-CRMEB-tianjiawenjian-mianxing',
  'icon-CRMEB-qiandao-mianxing',
  'icon-CRMEB-shangchengshezhi-mianxing',
  'icon-CRMEB-fenxiaoyuan-mianxing',
  'icon-CRMEB-xiadanjianshu-mianxing',
  'icon-CRMEB-shezhi-mianxing',
  'icon-CRMEB-tongji-mianxing',
  'icon-CRMEB-shangpinguanli-mianxing',
  'icon-CRMEB-wenzhangguanli-mianxing',
  'icon-CRMEB-zichantongji-mianxing',
  'icon-CRMEB-yunyingtongji-mianxing',
  'icon-CRMEB-fangkeshu-mianxing-2',
  'icon-CRMEB-zichan-mianxing',
  'icon-CRMEB-yingyee-mianxing',
]

const model = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value || ''),
})

const selectIcon = (icon) => {
  emit('update:modelValue', icon)
}
</script>

<style lang="less" scoped>
.menu-icon-select {
  width: 100%;

  :deep(.ivu-poptip-rel) {
    width: 100%;
  }

  :deep(.ivu-input-prefix) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.menu-icon-select-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: var(--ui-space-8);
}

.menu-icon-select-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-xs);
  color: var(--ui-color-text);
  background: transparent;
  cursor: pointer;

  &:hover,
  &.active {
    border-color: var(--ui-color-primary);
    color: var(--ui-color-primary);
    background: var(--ui-color-surface-hover);
  }
}
</style>
