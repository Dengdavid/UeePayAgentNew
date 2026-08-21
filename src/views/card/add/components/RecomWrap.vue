<template>
 <div class="recomWrap list-b-16" :class="{ 'is-loading': loading }" :aria-busy="loading">
    <Spin fix v-if="loading" size="large"></Spin>
    <div class="recomWrap-thead">
      <h3>{{ $t('card.index.opening.recommendation.title') }}</h3>
      <div class="recomWrap-thead-desc">
        <p>{{ $t('card.index.opening.recommendation.subtitle') }}</p>
        <Button type="text" v-if="sceneCategoryId" @click="clearScene()">{{ $t('card.index.opening.recommendation.reset') }}</Button>
      </div>
    </div>
    <div class="recomWrap-content list-b-16">
      <div class="recomWrap-section list-b-8">
        <div class="recomWrap-sceneCategory">
          <button type="button" class="sceneCategory-item" :class="{'actived':item.id==sceneCategoryId}" :aria-pressed="item.id==sceneCategoryId" v-for="item in options.sceneCategory" :key="item.id" @click="getSceneList(item)">
            <span class="iconfont" :class="item.icon || 'icon-qita'"></span>
            <p>{{ item.name }}</p>
          </button>
        </div>
      </div>
      <template v-if="sceneCategoryId">
        <div class="recomWrap-desc" v-if="c_scene(sceneCategoryId)?.desc">
          <p>{{ c_scene(sceneCategoryId)?.desc }}</p>
        </div>
        <div class="recomWrap-scene list-b-8">
          <div class="recomWrap-section-title">
            <span>{{ $t('card.index.opening.recommendation.matchingPlatforms') }}</span>
            <span class="count">{{ options.scene.length }}</span>
          </div>
          <div class="recomWrap-scene-list" v-if="options.scene.length>0">
            <button type="button" class="recomWrap-scene-item" :class="{'actived':item.name==sceneName}" :aria-pressed="item.name==sceneName" v-for="item in options.scene" :key="item.id || item.name" @click="getBindList(item.name)">{{ item.name }}</button>
          </div>
          <p class="noData" v-else>
            <Icon type="ios-information-circle-outline" size="16"></Icon>
            <span>{{ $t('card.index.opening.recommendation.noMatchingPlatforms') }}</span>
          </p>
        </div>
        <div class="recomWrap-bin list-b-8">
          <div class="recomWrap-section-title">
            <span>{{ $t('card.index.opening.recommendation.recommendedBins') }}</span>
            <span class="count" :class="{ active: recommendedBins.length }">{{ recommendedBins.length }}</span>
          </div>
          <div class="recomWrap-bin-list list-b-6" v-if="recommendedBins.length>0">
            <CardTag v-for="(item, index) in recommendedBins" :key="item.id || item.bin" :item="item" :checked="selectBin?.bin === item.bin"
              @on-click="onBin(item,index)">
            </CardTag>
          </div>
          <p class="noData" v-else>
            <Icon type="ios-information-circle-outline" size="16"></Icon>
            <span>{{ sceneName ? $t('card.index.opening.recommendation.noVerifiedBins') : $t('card.index.opening.recommendation.selectPlatform') }}</span>
          </p>
        </div>
      </template>
    </div>
 </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { getApi, message, t } from '@/utils'
import CardTag from './card-tag-small.vue'
import { Spin, Icon, Button } from 'view-ui-plus'

const loading = ref(false)

const props = defineProps({
  bins: {
    type: Array,
    default: () => []
  },
  selectBin: {
    type: Object,
    default: () => ({})
  },
})
const options =reactive({
  sceneCategory:[],
  scene:[],
  bind:[],
})
const sceneCategoryId=ref("")
const sceneName=ref("")
let bindRequestId=0
const c_scene=(id)=>{
  if(options.sceneCategory?.length>0){
    return options.sceneCategory.find(item=>item.id==id)
  }
  return {}
}
const c_recomBins=(recomBins=[],bins=[])=>{
  const recomBinSet = new Set(recomBins.map(bin => String(bin)))
  const newArr=[]
  if(bins?.length>0){
    bins.forEach(el=>{
      if(recomBinSet.has(String(el.bin))){
        newArr.push(el)
      }
    })
  }
  return newArr
}
const recommendedBins=computed(()=>c_recomBins(options.bind,props.bins))
const emit=defineEmits(["on-bin",'showBinBtn'])
const onBin=(item,index)=>{
  emit("on-bin",item.bin,index)
}
const clearScene=()=>{
  bindRequestId+=1
  loading.value=false
  sceneCategoryId.value =""
  sceneName.value = ""
  options.scene = []
  options.bind=[]
}
//获取场景分类
const getSceneCategoryList = async () => {
  loading.value = true
  try {
    const res = await getApi("/vcc/getConsumptionScenes")
    options.sceneCategory = res?.tree || []
    options.bind=[]
  } catch (error) {
    options.sceneCategory=[]
    message(error?.msg || t('card.index.opening.recommendation.loadScenesFailed'), 'error')
  } finally {
    loading.value = false
  }
}
//获取产品
const getSceneList = (row) => {
  bindRequestId+=1
  loading.value=false
  sceneCategoryId.value =sceneCategoryId.value===row.id?"":row.id
  sceneName.value = ""
  options.scene = sceneCategoryId.value ? row.children || [] : []
  options.bind=[]
}
//获取交易平台
const getBindList = async (name) => {
  if(sceneName.value===name){
    sceneName.value=''
    options.bind=[]
    bindRequestId+=1
    loading.value=false
    return
  }
  sceneName.value = name
  options.bind=[]
  const requestId=++bindRequestId
  loading.value = true
  try {
    const res = await getApi("/vcc/scene", { scene: name })
    if(requestId!==bindRequestId || sceneName.value!==name){
      return
    }
    options.bind = Array.isArray(res) ? res : Object.values(res || {})
  } catch (error) {
    if(requestId===bindRequestId){
      options.bind=[]
      message(error?.msg || t('card.index.opening.recommendation.loadBinsFailed'), 'error')
    }
  } finally {
    if(requestId===bindRequestId){
      loading.value = false
    }
  }
}
watch(
  [recommendedBins, sceneName],
  ([bins, scene])=>emit('showBinBtn', bins.map(bin=>bin.id), Boolean(scene)),
  { immediate: true }
)
onMounted(()=>{
  getSceneCategoryList()
})
</script>

<style scoped lang="less">
.recomWrap{
  position: relative;
  color: var(--ui-color-text);
  &.is-loading{
    .recomWrap-content{
      pointer-events: none;
      opacity: .62;
    }
  }
  .recomWrap-content{
    transition: opacity .2s ease;
  }
  .recomWrap-bin-list{
    display: grid;
    grid-template-columns: repeat(2,1fr);
    gap:6px;
    max-height:600px;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 2px;
  }
  .recomWrap-thead{
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f2f5;
    h3 {
      font-size: 18px;
      line-height: 24px;
      font-weight: 600;
      color: var(--ui-color-text);
    }
    p{
      font-size: 12px;
      line-height: 18px;
      color: var(--ui-color-text-muted);
    }
    .recomWrap-thead-desc{
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 24px;
      margin-top: 8px;
      color: var(--ui-color-text-muted);
      font-size: 12px;
    }
  }
  .recomWrap-section-title{
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-color-control-text);
    font-weight: 500;
    .count{
      min-width: 20px;
      height: var(--ui-size-18);
      padding: var(--ui-padding-0-6);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--ui-radius-9);
      color: var(--ui-color-text-muted);
      background: #f3f5f8;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      &.active{
        color: var(--primary-color);
        background: rgba(var(--primary-color-rgb, 43, 92, 217), .08);
      }
    }
  }
  .noData{
    min-height: 52px;
    padding: var(--ui-padding-8-12);
    display: flex;
    justify-content: center;
    align-items: center;
    gap:6px;
    background: #f7f9fc;
    color: var(--ui-color-text-muted);
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    border-radius: var(--ui-radius-sm);
  }
  .recomWrap-sceneCategory{
    display: grid;
    grid-template-columns: repeat(2,1fr);
    gap: 8px;
    .sceneCategory-item{
      width: 100%;
      min-width: 0;
      border-radius: var(--ui-radius-sm);
      overflow: hidden;
      height: var(--ui-size-38);
      display: flex;
      align-items: center;
      padding:var(--ui-padding-0-16);
      gap:6px;
      color: var(--ui-color-text);
      font-family: inherit;
      text-align: left;
      .iconfont{
        font-size: 14px !important;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      p{
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      cursor: pointer;
      background: var(--ui-color-surface);
      border:1px #EBEBEB solid;
      transition: color .2s ease, border-color .2s ease, background-color .2s ease;
      &:hover{
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
      &.actived{
        color: var(--primary-color);
        border-color: var(--primary-color);
        background: linear-gradient(165deg, #fff 50%, #f4f8ff 100%);
      }
      &:focus-visible{
        outline: 2px solid rgba(var(--primary-color-rgb, 43, 92, 217), .28);
        outline-offset: 2px;
      }
    }
  }
  .recomWrap-desc{
    background: #f7f9fc;
    border-left: 2px solid rgba(var(--primary-color-rgb, 43, 92, 217), .35);
    padding:var(--ui-padding-8-10);
    border-radius: var(--ui-radius-sm);
    display: flex;
    flex-direction: column;
    gap: 2px;
    p{
      flex: 1;
      overflow: hidden;
      color: var(--ui-color-control-text);
      font-size: 12px;
      line-height: 20px;
    }
  }
  .recomWrap-scene{
    .recomWrap-scene-list{
      display: flex;
      flex-wrap: wrap;
      gap:4px;
      .recomWrap-scene-item{
        border-radius: var(--ui-radius-sm);
        overflow: hidden;
        min-height: 28px;
        padding:var(--ui-padding-2-12);
        background: var(--ui-color-surface);
        border: var(--ui-border-muted);
        cursor: pointer;
        color: var(--ui-color-text);
        font-family: inherit;
        font-size: 13px;
        line-height:22px;
        box-sizing: border-box;
        transition: color .2s ease, border-color .2s ease, background-color .2s ease;
        &:hover{
          color: var(--primary-color);
          border-color: var(--primary-color);
        }
        &.actived{
          color: var(--primary-color);
          border-color: var(--primary-color);
          background: linear-gradient(165deg, #fff 50%, #f4f8ff 100%);
        }
        &:focus-visible{
          outline: 2px solid rgba(var(--primary-color-rgb, 43, 92, 217), .28);
          outline-offset: 2px;
        }
      }
    }
  }
  @media screen and (max-width: 768px){
    .recomWrap-sceneCategory .sceneCategory-item{
      height: var(--ui-size-44);
      padding: var(--ui-padding-0-12);
    }
    .recomWrap-scene .recomWrap-scene-list .recomWrap-scene-item{
      min-height: 44px;
      padding: var(--ui-padding-10-14);
    }
  }
  @media (prefers-reduced-motion: reduce){
    .recomWrap-content,
    .sceneCategory-item,
    .recomWrap-scene-item{
      transition: none !important;
    }
  }
}
</style>
