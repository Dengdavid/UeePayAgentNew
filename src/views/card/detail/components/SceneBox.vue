<template>
  <div class="sceneBox">
    <div class="sceneBox-content">
      <span class="scene-mode">{{ sceneTypeName(card) }}</span>
      <Tooltip v-if="categoryItems.length" :content="categoryTooltip" placement="top" theme="light" :max-width="320" transfer>
        <span class="scene-count">{{ $t('card.detail.sceneBox.categoryCount', { count: categoryItems.length }) }}</span>
      </Tooltip>
      <Tooltip v-if="sceneItems.length" :content="sceneTooltip" placement="top" theme="light" :max-width="320" transfer>
        <span class="scene-count">{{ $t('card.detail.sceneBox.sceneCount', { count: sceneItems.length }) }}</span>
      </Tooltip>
      <Button class="scene-edit" type="text" @click="opnePup(card)">{{ $t('card.detail.sceneBox.edit') }}</Button>
    </div>
    <SceneBoxPup :cardId="cardId" :driver="cardDriver" ref="pupRef" @onConfirm="onConfirm"/>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { postApi } from '@/utils/api'
  import { message } from '@/utils/message'
  import { t } from '@/utils/index.js'
  import { useCardStoreRefs } from '@/utils/store.js'
  import SceneBoxPup from './SceneBoxPup.vue'
  const props = defineProps({
    card:{
      type:Object,
      default:()=>{
        return {}
      }
    },
  });
  const { binMaps } = useCardStoreRefs()
  const cardDriver = computed(() => props.card?.driver || binMaps.value?.[props.card?.card_bin]?.driver || '')
  const categoryItems = computed(() => props.card?.consumption_scene_config?.categoryIds || [])
  const sceneItems = computed(() => props.card?.consumption_scene_config?.sceneIds || [])
  const getItemNames = (items) => items.map(item => {
    if (typeof item === 'string' || typeof item === 'number') return String(item)
    return item?.name || item?.category_name || item?.label || item?.id
  }).filter(Boolean)
  const categoryTooltip = computed(() => getItemNames(categoryItems.value).join(t('card.detail.sceneBox.listSeparator')))
  const sceneTooltip = computed(() => getItemNames(sceneItems.value).join(t('card.detail.sceneBox.listSeparator')))
  const sceneTypeName=(card)=>{
    const {consumption_scene_type:type}=card
    if (type===0) {
      return t('card.detail.sceneBox.unrestricted')
    }else if (type===1) {
      return t('card.detail.sceneBox.whitelist')
    }else if (type===2) {
      return t('card.detail.sceneBox.blacklist')
    }
  }
  const cardId=ref('')
  const pupRef=ref(null)
  const opnePup=(row)=>{
    const {consumption_scene_type:type,consumption_scene_config:config}=row
    cardId.value = row.id
    pupRef.value?.open({
      type:type,
      config:Array.isArray(config)?{categoryIds:config,sceneIds:[]}:config,
    })
  }
  const emit = defineEmits(['onConfirm']);
  const onConfirm=(form)=>{
    const {type,config}=form
    postApi('/vcc/updateConsumptionScene',{
      cardId:cardId.value,
      type:type,
      categoryIds:config.categoryIds.map(item=>item.id) || [],
      sceneIds:config.sceneIds.map(item=>item.id) || [],
    }).then((res) => {
      pupRef.value?.close()
      emit('onConfirm')
    }).catch(err => {
      message(err?.msg || err || t('card.detail.sceneBox.settingFailed'),'error')
    }).finally(() => {
      pupRef.value?.buttonLoading()
    })
  }
</script>

<style scoped lang="less">
.sceneBox{
  flex: 1;
  min-width: 0;

  .sceneBox-content{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;

    :deep(.ivu-tooltip-rel) {
      display: inline-flex;
    }
  }

  .scene-mode {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 26px;
    color: var(--ui-color-text);
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;

    &::before {
      width: var(--ui-size-6);
      height: var(--ui-size-6);
      border-radius: var(--ui-radius-circle);
      background: var(--primary-color);
      content: '';
    }
  }

  .scene-count {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    height: var(--ui-size-26);
    padding: var(--ui-padding-0-8);
    color: var(--ui-color-neutral-700);
    font-size: 13px;
    line-height: 26px;
    border: 0;
    border-radius: var(--ui-radius-sm);
    background: #edf1f7;
    cursor: help;
    transition: color 0.2s, background-color 0.2s;

    &:hover {
      color: var(--primary-color);
      background: #e5edff;
    }
  }

  :deep(.scene-edit.ivu-btn) {
    height: var(--ui-size-26);
    padding: var(--ui-padding-0-6);
    color: var(--primary-color);
    font-size: 13px;
    line-height: 26px;
    border-radius: var(--ui-radius-sm);

    &:hover,
    &:focus-visible {
      background: rgba(43, 92, 217, 0.08);
    }
  }
}
</style>
