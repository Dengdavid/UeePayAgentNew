<template>
  <FormPupBox :pup="pup" :inner="false">
    <template #default="{form}">
      <div class="sceneBox-pup">
        <div class="scene-thead">
            <div class="scene-thead-title">
              <h3>{{ $t('card.detail.sceneBox.setType') }}</h3>
              <p>{{ getText(form.type).tips }}</p>
            </div>
            <div class="scene-thead-tag" role="group" :aria-label="$t('card.detail.sceneBox.setType')">
              <button type="button" class="scene-thead-tag-item" :class="{
                'active':form.type==item.value,
                'disabled':item.disabled
              }" v-for="item in types" :key="item.value" :disabled="item.disabled" :aria-pressed="form.type==item.value" @click="onChangeType(item)">
                {{ item.label }}
              </button>
            </div>
        </div>
        <div class="scene-thead-info list-b-4" v-if="binRow?.cardRule && (binRow?.cardRule?.consumption_scene_config?.merchantNameList?.length>0 || binRow?.cardRule?.consumption_scene_config?.mccList?.length>0)">
          <dl v-if="binRow?.cardRule?.consumption_scene_config?.merchantNameList?.length>0">
            <dt>{{ $t('card.detail.sceneBox.merchantName') }}</dt>
            <dd >{{ binRow?.cardRule?.consumption_scene_config?.merchantNameList?.join(',') }}</dd>
          </dl>
          <dl v-if="binRow?.cardRule?.consumption_scene_config?.mccList?.length>0">
            <dt>{{ $t('card.detail.sceneBox.mccCode') }}</dt>
            <dd>{{ binRow.cardRule.consumption_scene_config?.mccList?.join(',') || $t('card.detail.sceneBox.notSet') }}</dd>
          </dl>
        </div>
        <div class="scene-content">
            <div class="thead">
              <div class="title">
                <h4>{{ $t('card.detail.sceneBox.selectSceneRange') }}</h4>
              </div>
              <div class="desc">
                <p v-html="$t('card.detail.sceneBox.selectedCategories', { count: form.config?.categoryIds?.length || 0 })"></p>
                <p v-html="$t('card.detail.sceneBox.selectedScenes', { count: form.config?.sceneIds?.length || 0 })"></p>
              </div>
            </div>
            <div v-if="isPhone" class="scene-mobile-tabs" role="tablist" :aria-label="$t('card.detail.sceneBox.selectSceneRange')">
              <button type="button" role="tab" :aria-selected="mobilePanel === 'available'" :class="{ active: mobilePanel === 'available' }" @click="mobilePanel = 'available'">
                {{ $t('card.detail.sceneBox.availableScenes') }}
              </button>
              <button type="button" role="tab" :aria-selected="mobilePanel === 'configured'" :class="{ active: mobilePanel === 'configured' }" @click="mobilePanel = 'configured'">
                {{ $t('card.detail.sceneBox.configuredScenes') }}
                <span>{{ selectedTotal }}</span>
              </button>
            </div>
            <div class="content">
              <div v-show="!isPhone || mobilePanel === 'available'" class="left">
                <div class="content-hd">
                    <Input v-model="searchValue" :placeholder="$t('card.detail.sceneBox.availableSearchPlaceholder')" :disabled="form.type===0">
                      <template #prefix>
                          <Icon type="md-search" />
                      </template>
                    </Input>
                </div>
                <div class="content-btn">
                  <p>{{ $t('card.detail.sceneBox.categoryIncludesAll') }}</p>
                  <Button type="text"  @click="openOrclose(true)">{{ $t('card.detail.sceneBox.expandAll') }}</Button>
                  <Divider type="vertical" />
                  <Button type="text"  @click="openOrclose(false)">{{ $t('card.detail.sceneBox.collapseAll') }}</Button>
                </div>
                <div class="content-tbody">
                  <div class="content-tree">
                    <div class="ul">
                      <template v-for="item in allChannels" :key="item.id">
                        <div class="li" v-if="item.name?.toLowerCase().includes(searchValue.toLowerCase()) || item?.children?.some(c=>c.name.toLowerCase().includes(searchValue.toLowerCase()))">
                          <div
                            class="li-hd"
                            role="checkbox"
                            :aria-checked="c_categoryIds.includes(normalizeId(item.id))"
                            :aria-disabled="disabledCategory(item) || !item.id"
                            :tabindex="disabledCategory(item) || !item.id ? -1 : 0"
                            :title="disabledCategory(item) || !item.id ? getDisabledReason(item) : ''"
                            @click="selectCategory(item)"
                            @keydown.enter.prevent="selectCategory(item)"
                            @keydown.space.prevent="selectCategory(item)"
                          >
                            <template v-if="c_categoryIds.includes(normalizeId(item.id))">
                              <Icon class="iconBtn" color="var(--ui-color-success)" type="md-checkmark" />
                            </template>
                            <template v-else>
                              <Icon class="iconBtn" color="#999aaa" type="md-arrow-dropup" @click.stop="item.hidden=!item.hidden" v-if="item.hidden"/>
                              <Icon class="iconBtn" color="#999aaa" type="md-arrow-dropdown" @click.stop="item.hidden=!item.hidden" v-else/>
                            </template>
                            <div class="checkbox" :class="{
                              active:c_categoryIds.includes(normalizeId(item.id)) && !disabledCategory(item),
                              disabled:disabledCategory(item) || !item.id
                            }">
                              <Icon class="iconBtn" color="#fff" type="md-checkmark" v-if="c_categoryIds.includes(normalizeId(item.id)) && !disabledCategory(item)"/>
                            </div>
                            <p>{{ item.name || $t('card.detail.sceneBox.unnamedCategory') }}</p>
                            <span class="tag">{{ item?.children?.length || 0 }}</span>
                          </div>
                          <div class="ul" v-show="!c_categoryIds.includes(normalizeId(item.id)) && !item.hidden">
                            <template v-for="children in item.children" :key="children.id">
                              <div class="li" v-if="children.name.toLowerCase().includes(searchValue.toLowerCase())">
                                <div
                                  class="li-hd"
                                  role="checkbox"
                                  :aria-checked="c_sceneIds.includes(normalizeId(children.id))"
                                  :aria-disabled="disabledScene(children)"
                                  :tabindex="disabledScene(children) ? -1 : 0"
                                  :title="disabledScene(children) ? getDisabledReason(children) : ''"
                                  @click="selectScene(item,children)"
                                  @keydown.enter.prevent="selectScene(item,children)"
                                  @keydown.space.prevent="selectScene(item,children)"
                                >
                                  <Icon class="iconBtn"/>
                                  <div class="checkbox" :class="{
                                    active:c_sceneIds.includes(normalizeId(children.id)) && !disabledScene(children),
                                    disabled:disabledScene(children)
                                  }">
                                    <Icon class="iconBtn" color="#fff" type="md-checkmark" v-if="c_sceneIds.includes(normalizeId(children.id)) && !disabledScene(children)"/>
                                  </div>
                                  <p>{{ children.name }}</p>
                                </div>
                              </div>
                            </template>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
              <div v-show="!isPhone || mobilePanel === 'configured'" class="right">
                  <div class="content-hd">
                    <Input v-model="searchRightValue" :placeholder="$t('card.detail.sceneBox.configuredSearchPlaceholder')" :disabled="form.type===0">
                      <template #prefix>
                        <Icon type="md-search" />
                      </template>
                    </Input>
                </div>
                <div class="content-btn">
                  <p>{{ $t('card.detail.sceneBox.configuredScenes') }}</p>
                  <Button type="text" danger  @click="clearConfig" :disabled="(form?.config?.categoryIds?.length===0 && form?.config?.sceneIds?.length===0) || form.type===0">{{ $t('card.detail.sceneBox.clear') }}</Button>
                </div>
                <div class="content-tbody">
                  <div v-if="selectedTotal === 0" class="content-empty">
                    <Icon type="md-options" />
                    <p>{{ $t('card.detail.sceneBox.noConfiguredScenes') }}</p>
                  </div>
                  <template v-if="form.config?.categoryIds?.length>0">
                    <template v-for="(item,index) in form.config?.categoryIds" :key="item.id">
                      <div class="content-item category" v-if="searchRightValue?item.name.includes(searchRightValue):true">
                        <div class="content-item-title">
                          <h5>{{ item.name || $t('card.detail.sceneBox.unnamedCategory') }}</h5>
                          <p>{{ $t('card.detail.sceneBox.containsScenes', { count: allChannels.find((i)=>normalizeId(i.id)===normalizeId(item.id))?.children?.length || 0 }) }}</p>
                        </div>
                        <button v-if="deleteShow(binRow?.consumption_scene_config?.categoryIds,item)" class="content-remove" type="button" :aria-label="$t('card.detail.sceneBox.removeConfigured', { name: item.name })" @click="removeBtn(form.config?.categoryIds,index,true)">
                          <Icon type="md-trash" />
                        </button>
                      </div>
                    </template>
                  </template>
                  <template v-if="form.config?.sceneIds?.length>0">
                    <template v-for="(item,index) in form.config?.sceneIds" :key="item.id">
                      <div class="content-item" v-if="searchRightValue?item.name.includes(searchRightValue):true">
                        <div class="content-item-title">
                          <h5>{{ item.name }}</h5>
                          <p>{{ item.cate_name || item.cate_id || $t('card.detail.sceneBox.uncategorized') }}</p>
                        </div>
                        <button v-if="deleteShow(binRow?.consumption_scene_config?.sceneIds,item)" class="content-remove" type="button" :aria-label="$t('card.detail.sceneBox.removeConfigured', { name: item.name })" @click="removeBtn(form.config?.sceneIds,index,false)">
                          <Icon type="md-trash" />
                        </button>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
        </div>
        <div class="scene-save-summary" :class="`scene-save-summary--${form.type}`" aria-live="polite">
          <Icon :type="form.type === 2 ? 'md-alert' : 'md-information-circle'" :size="16" aria-hidden="true" />
          <p>
            <strong>{{ $t('card.detail.sceneBox.saveImpact') }}</strong>
            <span>{{ getSaveSummary(form) }}</span>
          </p>
        </div>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
  import { ref, reactive, computed, nextTick } from 'vue'
  import { message,confirm } from '@/utils/message'
  import { getApi } from '@/utils/api'
  import { t } from '@/utils/index.js'
  import { isPhone } from '@/utils/device.js'
  const props = defineProps({
    binId:{
      type:[String,Number],
      default:''
    },
    cardId:{
      type:[String,Number],
      default:''
    },
    driver: {
      type: String,
      default: ''
    },
  });
  const searchValue = ref('');
  const searchRightValue = ref('');
  const mobilePanel = ref('available');
  const allChannels = ref([]);
  const binRow = ref(null);
  let openRequestId = 0
  const driverNotBlack=['photon']
  const normalizeId = (value) => value == null ? '' : String(value)
  const types=computed(()=>{
    return [
      {
        value:0,
        label: t('card.detail.sceneBox.unrestricted')
      },
      {
        value:1,
        label: t('card.detail.sceneBox.whitelist'),
      },
      {
        value:2,
        label: t('card.detail.sceneBox.blacklist'),
        disabled:driverNotBlack.includes(props.driver.toLowerCase())
      },
    ]
  })
  // 获取交易场景显示文本
  const getText = (type) => {
    let baseText = '';
    let baseTips = '';
    if (type === 0) {
      baseText = t('card.detail.sceneBox.unrestrictedText');
      baseTips = t('card.detail.sceneBox.unrestrictedTips');
    } else if (type === 1) {
      baseText = t('card.detail.sceneBox.whitelistText');
      baseTips = t('card.detail.sceneBox.whitelistTips');
    } else if (type === 2) {
      baseText = t('card.detail.sceneBox.blacklistText');
      baseTips = t('card.detail.sceneBox.blacklistTips');
    }
    return {
      text:baseText,
      tips:baseTips,
    };
  };
  const getTypeName=(type)=>{
    if (type === 0) return t('card.detail.sceneBox.unrestricted')
    if (type === 1) return t('card.detail.sceneBox.whitelist')
    if (type === 2) return t('card.detail.sceneBox.blacklist')
  }
  const deleteShow=(arr=[],item)=>{
    if(binRow.value?.consumption_scene_type===1) return true;
    if(binRow.value?.consumption_scene_type===2){
      if(arr?.length>0){
        return !arr?.map(el=>String(el.id)).includes(String(item.id))
      }
    }
    return true
  }
  //判断是否已配置
  const c_categoryIds=computed(()=>{
    const arr = pup.form?.config?.categoryIds;
    return Array.isArray(arr) ? arr.map(item=>normalizeId(item.id)) : [];
  })
  const c_sceneIds=computed(()=>{
    const arr = pup.form?.config?.sceneIds;
    return Array.isArray(arr) ? arr.map(item=>normalizeId(item.id)) : [];
  })
  const selectedTotal=computed(()=>(
    (pup.form?.config?.categoryIds?.length || 0) + (pup.form?.config?.sceneIds?.length || 0)
  ))
  const getDisabledReason=(item)=>{
    if(pup.form.type===0) return t('card.detail.sceneBox.unrestrictedNoSelection')
    if(!item?.id) return t('card.detail.sceneBox.sceneUnavailable')
    return t('card.detail.sceneBox.binRuleRestricted')
  }
  const getSaveSummary=(form)=>{
    const params={
      categories:form.config?.categoryIds?.length || 0,
      scenes:form.config?.sceneIds?.length || 0,
    }
    if(form.type===1) return t('card.detail.sceneBox.whitelistSaveSummary',params)
    if(form.type===2) return t('card.detail.sceneBox.blacklistSaveSummary',params)
    return t('card.detail.sceneBox.unrestrictedSaveSummary')
  }
  //是否禁用分类
  const disabledCategory=(item)=>{
    if(pup.form.type===0) return true
    const arr = binRow.value?.consumption_scene_config?.categoryIds?.map(el=>normalizeId(el.id)) || [];
    const itemId = normalizeId(item.id)
    if(binRow.value?.consumption_scene_type===1) return !arr.includes(itemId);
    if(binRow.value?.consumption_scene_type===2) return arr.includes(itemId);
    return false;
  }
  //选中分类
  const selectCategory=(item)=>{
    if(disabledCategory(item)  || !item.id) return
    const arr=pup.form.config.categoryIds
    const index=arr.findIndex(el=>normalizeId(el.id)===normalizeId(item.id))
    if(index==-1){
      arr.push({
        id:item.id,
        name:item.name,
      })
      pup.form.config.sceneIds=pup.form.config?.sceneIds?.filter(scene=>normalizeId(scene.cate_id)!==normalizeId(item.id)) || []
    }else{
      arr.splice(index,1)
      if(pup.form.type===2 && binRow.value?.consumption_scene_type===2){
        const parentSceneIds = binRow.value?.consumption_scene_config?.sceneIds?.map(el => normalizeId(el.id)) || [];
        if (parentSceneIds.length > 0 && item.children) {
            const scenesToRestore = item.children.filter(child => parentSceneIds.includes(normalizeId(child.id)));
            const currentSceneIds = pup.form.config.sceneIds.map(s => normalizeId(s.id));
            scenesToRestore.forEach(scene => {
                if (!currentSceneIds.includes(normalizeId(scene.id))) {
                    pup.form.config.sceneIds.push({
                        id: scene.id,
                        name: scene.name,
                        cate_id: item.id,
                        cate_name: item.name
                    });
                }
            });
        }
      }
    }
  }
  //是否禁用场景
  const disabledScene=(item)=>{
    if(pup.form.type===0) return true
    if(!item.id || item.id===0) return true
    if(!binRow.value) return false;
    const parentsceneIds = binRow.value?.consumption_scene_config?.sceneIds?.map(el=>normalizeId(el.id)) || [];
    const parentCateIds = binRow.value?.consumption_scene_config?.categoryIds?.map(el=>normalizeId(el.id)) || [];
    const itemId = normalizeId(item.id)
    const categoryId = normalizeId(item.cate_id)
    if(binRow.value?.consumption_scene_type===1) {
      return !(parentsceneIds.includes(itemId) || parentCateIds.includes(categoryId));
    }
    if(binRow.value?.consumption_scene_type===2) {
      return parentsceneIds.includes(itemId) || parentCateIds.includes(categoryId);
    }
    return false;
  }
  //选中场景
  const selectScene=(item,children)=>{
    if(disabledScene(children)) return
    const arr=pup.form.config.sceneIds
    const index=arr.findIndex(el=>normalizeId(el.id)===normalizeId(children.id))
    if(index==-1){
      arr.push({
        id:children.id,
        name:children.name,
        cate_id:item.id,
        cate_name:item.name
      })
    }else{
      arr.splice(index,1)
    }
  }
  //初始化配置
  const configInit=(binConfig)=>{
    pup.form.config={
      categoryIds:binConfig?JSON.parse(JSON.stringify(binConfig?.consumption_scene_config?.categoryIds || [])):[],
      sceneIds:binConfig?JSON.parse(JSON.stringify(binConfig?.consumption_scene_config?.sceneIds || [])):[],
    }
  }
  //切换类型
  const onChangeType=(item)=>{
    if(item.disabled) return
    if(binRow.value && binRow.value.consumption_scene_type!=0){
      message(`${t('card.detail.sceneBox.cardBinSet')}${getTypeName(binRow.value.consumption_scene_type)}，${t('card.detail.sceneBox.cannotSwitch')}`,'error')
      return
    }
    if(item.value===0){
      const {config}=pup?.form
      if(config.sceneIds?.length>0 || config?.categoryIds?.length>0){
         confirm(t('card.detail.sceneBox.switchWillClear')).then(()=>{
          configInit()
          pup.form.type=item.value
        })
        return
      }else{
        configInit()
      }
    }
    pup.form.type=item.value
  }
  //清空配置
  const clearConfig=()=>{
    if(pup.form.type==0) return
    confirm(t('card.detail.sceneBox.confirmClear')).then(()=>{
      if(binRow.value?.consumption_scene_type===2){
        configInit(binRow.value)
      }else{
        configInit()
      }
    })
  }
  //移除场景
  const removeBtn=(list,index,isCategory=false)=>{
    if(pup.form.type==0) return
    const removedItem = list[index];
    list.splice(index,1)
    if (isCategory && pup.form.type === 2 && binRow.value?.consumption_scene_type === 2) {
        const parentSceneIds = binRow.value?.consumption_scene_config?.sceneIds?.map(el => normalizeId(el.id)) || [];
        if (parentSceneIds.length > 0) {
            const categoryItem = allChannels.value.find(c => normalizeId(c.id) === normalizeId(removedItem.id));
            if (categoryItem && categoryItem.children) {
                const scenesToRestore = categoryItem.children.filter(child => parentSceneIds.includes(normalizeId(child.id)));
                const currentSceneIds = pup.form.config.sceneIds.map(s => normalizeId(s.id));
                scenesToRestore.forEach(scene => {
                    if (!currentSceneIds.includes(normalizeId(scene.id))) {
                        pup.form.config.sceneIds.push({
                            id: scene.id,
                            name: scene.name,
                            cate_id: categoryItem.id,
                            cate_name: categoryItem.name
                        });
                    }
                });
            }
        }
    }
  }
  //是否展开
  const openOrclose=(status)=>{
    allChannels.value.forEach(item=>{
      item.hidden=!status
    })
  }
  //获取bin配置
  const getBin=async(form)=>{
    try {
      const res=await getApi('/vcc/bin/currentRule',form)
      return res || {}
    } catch (err) {
      message(err,'error')
      return {}
    }
  }
  const getSceneCount=async(lists=[],config)=>{
    const arr=[]
    const map=new Map()
    const notCate={
      name: t('card.detail.sceneBox.uncategorized'),
      id:null,
      children:[]
    }
    lists.forEach((el)=>{
      const sceneIdsIndex=config?.sceneIds?.findIndex(item=>normalizeId(item.id)===normalizeId(el.id)) ?? -1
      //如果场景id存在
      if(sceneIdsIndex>-1 && config?.sceneIds){
        config.sceneIds[sceneIdsIndex].cate_id=el.cate_id || ''
        config.sceneIds[sceneIdsIndex].cate_name=el.category?.name ?? el.category_name ?? t('card.detail.sceneBox.uncategorized')
      }
      if(!el.cate_id){
        notCate.children.push(el)
      }else{
        let cate = map?.get(el.cate_id)
        if(!cate){
          cate = {
            name:el.category?.name || el.category_name,
            id:el.cate_id,
            children:[]
          }
          map?.set(el.cate_id, cate)
          arr.push(cate)
        }
        cate.children.push(el)
      }
    })
    arr.push(notCate)
    return arr
  }
  //获取场景列表
  const getSceneAll=async (config={})=>{
    const res=await getApi('/vcc/getAllConsumptionScenes')
    return getSceneCount(res,config)
  }
  const emit = defineEmits(['onConfirm']);
  const pup = reactive({
    status: false,
    title: t('card.detail.sceneBox.editConsumptionScene'),
    labelWidth: 120,
    width:isPhone.value?Math.max(280,window.innerWidth-24):800,
    form: {
      type:0,
      config:{
        categoryIds:[],
        sceneIds: []
      }
    },
    //操作
    actions: [
      {
        label: t('card.detail.sceneBox.confirm'),
        permission:'',
        click: (pup) => {
          const {type,config}=pup.form
          const {sceneIds,categoryIds}=config
          if(type!=0 && sceneIds?.length===0 && categoryIds?.length===0){
            message(t('card.detail.sceneBox.selectAtLeastOne'),'error')
            pup.loading = false
            return
          }
          emit('onConfirm',pup.form)
        }
      },
    ]
  })
  const close=()=>{
    openRequestId += 1
    pup.status = false
    pup.buttonLoading = false
  }
  const buttonLoading=()=>{
    pup.buttonLoading = false
    pup.loading = false
  }
  const open = async (row)=>{
    const requestId = ++openRequestId
    pup.loading=true
    mobilePanel.value='available'
    searchValue.value=''
    searchRightValue.value=''
    pup.form={
      type:row.type,
      config:{
        categoryIds:[],
        sceneIds:[]
      }
    }
    if(row.config){
      if(Array.isArray(row.config)){
        pup.form.config.sceneIds=JSON.parse(JSON.stringify(row.config))
      }else if(row.config?.sceneIds?.length>0 || row.config?.categoryIds?.length>0){
        pup.form.config=JSON.parse(JSON.stringify(row.config))
        if(!Array.isArray(pup.form.config.categoryIds)) pup.form.config.categoryIds = []
        if(!Array.isArray(pup.form.config.sceneIds)) pup.form.config.sceneIds = []
      }
    }
    pup.status=true
    try {
      await nextTick()
      const channels = await getSceneAll(pup.form.config)
      if (requestId !== openRequestId || !pup.status) return
      allChannels.value = channels
      if((props.binId || props.cardId)){
        const binRes=await getBin({
          bin:props.binId,
          card_id:props.cardId,
        })
        if (requestId !== openRequestId || !pup.status) return
        if(binRes && binRes.consumption_scene_type!==0){
          if(pup.form.type!==binRes.consumption_scene_type){
            confirm(t('card.detail.sceneBox.typeMismatchConfirm')).then(()=>{
              if (requestId !== openRequestId || !pup.status) return
              binRow.value=binRes
              pup.form.type=binRes.consumption_scene_type
              configInit(binRes)
            })
            return
          }
        }
        binRow.value=binRes
      }
    } catch (err) {
      if (requestId === openRequestId && pup.status) {
        message(err?.msg || t('card.detail.sceneBox.loadFailed'), 'error')
      }
    } finally {
      if (requestId === openRequestId) pup.loading=false
    }
  }
  defineExpose({ open,close,buttonLoading });
</script>

<style scoped lang="less">
.sceneBox-pup{
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: min(600px, calc(100dvh - 180px));
  min-height: 420px;
  overflow: hidden;
  .bind-bin{
    display: flex;
    align-items: center;
    gap:4px;
    background: #f5f7fa;
    padding:var(--ui-padding-8-16);
    border-radius: var(--ui-radius-6);
    >*{
      line-height: 24px;
      display: flex;
      align-items: center;
    }
    p{
      flex: 1;
    }
  }
  .scene-thead-info{
    background: #f5f7fa;
    padding:var(--ui-padding-12-16);
    border-radius: var(--ui-radius-6);
    font-size: 12px;
    dl{
      display: flex;
      dt{
        width: var(--ui-size-80);
        color: var(--ui-color-text-secondary);
      }
      dd{
        flex: 1;
        overflow: hidden;
      }
    }
  }
  .scene-thead{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
    padding: var(--ui-padding-8-16);
    border-radius: var(--ui-radius-6);
    .scene-thead-title{
      h3{
        font-size: 16px;
      }
      p{
        font-size: 12px;
        color: var(--ui-color-text-secondary);
        margin-top: 4px;
      }
    }
    .scene-thead-tag{
      display: flex;
      gap:2px;
      background: #e8eef4;
      padding:var(--ui-padding-4);
      border-radius: var(--ui-radius-full);
      .scene-thead-tag-item{
        min-height: 30px;
        border: 0;
        font-size: 12px;
        padding: var(--ui-padding-4-8);
        border-radius: var(--ui-radius-full);
        color: var(--ui-color-neutral-800);
        background: transparent;
        overflow: hidden;
        cursor: pointer;
        min-width:60px;
        text-align: center;
        transition: color .18s ease, background-color .18s ease;
        &:hover{
          color: var(--primary-color);
        }
        &:focus-visible{
          outline: 2px solid rgba(43, 92, 217, .25);
          outline-offset: 1px;
        }
        &.disabled{
          color: var(--ui-color-text-secondary);
          cursor: not-allowed;
        }
        &.active{
          background: var(--primary-color);
          color:  var(--ui-color-text-inverse);
          .ivu-icon{
            color: var(--ui-color-text-inverse) !important;
          }
        }
      }
    }
  }
  .scene-mobile-tabs{
    display: none;
  }
  .scene-content{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap:12px;
    overflow: hidden;
    .thead{
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title{
        h4{
          font-size: 14px;
        }
      }
      .desc{
        font-size: 12px;
        color: var(--ui-color-text-secondary);
        display: flex;
        align-items: center;
        .text-msg{
          color: var(--primary-color);
        }
      }
    }
    .content{
      flex: 1;
      overflow: hidden;
      display: flex;
      background: #f3f6fa;
      border: 0;
      border-radius: var(--ui-radius-6);
      gap: 6px;
      padding:var(--ui-padding-6);
      >*{
        flex: 1;
        overflow: hidden;
        background: #fff;
        border: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        border-radius: var(--ui-radius-6);
        >*{
          &:not(:last-child){
            border-bottom:1px #eee solid;
          }
        }
        .content-hd{
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fcfcfd;
          padding:3px 4px;
          .el-link{
            font-size: 12px;
          }
        }
        .content-tbody{
          flex: 1;
          overflow-x: hidden;
          padding:var(--ui-padding-8);
          display: flex;
          flex-direction: column;
          gap:0;
          .content-item{
            min-height: 48px;
            border: 0;
            border-radius: 0;
            padding:7px 42px 7px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            background: transparent;
            transition: background-color .18s ease;

            & + .content-item{
              border-top: 1px solid #f0f2f5;
            }

            .content-item-title{
              min-width: 0;

              h5,
              p{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }

            .content-remove{
              position: absolute;
              right: 6px;
              top: 50%;
              transform: translateY(-50%);
              width:var(--ui-size-30);
              height: var(--ui-size-30);
              padding: 0;
              border: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--ui-radius-full);
              color: var(--ui-color-text-muted);
              background: transparent;
              opacity: 0;
              cursor: pointer;
              transition: color .18s ease, background-color .18s ease, opacity .18s ease;
              &:hover{
                color: var(--error-color);
                background-color: rgba(237, 64, 20, .08);
              }
              &:focus-visible{
                color: var(--error-color);
                outline: 2px solid rgba(237, 64, 20, .18);
              }
            }
            h5{
              font-size: 14px;
              font-weight: 500;
              line-height: 20px;
            }
            p{
              font-size: 12px;
              line-height: 18px;
              color: #8a96a8;
              margin-top: 1px;
            }
            &:hover{
              background-color: #f7f9fc;

              .content-remove{
                opacity: 1;
              }
            }
            &:focus-within{
              background-color: #f7f9fc;

              .content-remove{
                opacity: 1;
              }
            }
            &.category{
              color: var(--primary-color);
              h5{
                position: relative;
                padding-left:16px;
                &::after{
                  content:'';
                  position: absolute;
                  left: 0;
                  top: 50%;
                  width:var(--ui-size-6);
                  height:var(--ui-size-6);
                  border-radius: var(--ui-radius-circle);
                  background: var(--primary-color);
                  transform: translateY(-50%);
                }
              }
            }
          }
          .content-empty{
            display: flex;
            flex: 1;
            min-height: 140px;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 8px;
            color: var(--ui-color-text-muted);
            font-size: 12px;
            text-align: center;

            .ivu-icon{
              color: #aeb8c8;
              font-size: 28px;
            }
          }
        }
      }
      .content-btn{
        padding:var(--ui-padding-2-8);
        display: flex;
        align-items: center;
        >*{
          line-height: 28px;
          font-size: 12px;
          color: var(--ui-color-text-secondary);
        }
        p{
          flex: 1;
          overflow: hidden;
        }
        .el-link{
          &:hover{
            color: var(--primary-color);
          }
        }
      }
      .left{
        .content-tbody{
          padding:var(--ui-padding-4);
        }
      }

      .right{
        .content-tbody{
          padding: 0;
        }
      }
    }
  }
  .scene-save-summary{
    display: flex;
    align-items: flex-start;
    gap: 7px;
    min-height: 42px;
    padding: var(--ui-padding-10-12);
    border: 1px solid #dce7ff;
    border-radius: var(--ui-radius-sm);
    color: var(--ui-color-neutral-800);
    background: rgba(245, 248, 255, .9);

    :deep(.ivu-icon){
      flex: none;
      margin-top: 2px;
      color: var(--primary-color);
    }

    p{
      min-width: 0;
      font-size: 12px;
      line-height: 20px;

      strong{
        margin-right: 8px;
        font-weight: 600;
      }
    }

    &--1{
      color: #7a4600;
      border-color: #ffe0a6;
      background: rgba(255, 248, 232, .95);

      :deep(.ivu-icon){ color: #d48806; }
    }

    &--2{
      color: var(--error-color);
      border-color: #ffe1da;
      background: rgba(255, 245, 243, .88);

      :deep(.ivu-icon){ color: var(--error-color); }
    }
  }
}
.content-tree{
  .ul{
    .li{
      .li-hd{
        min-height: 40px;
        line-height: 32px;
        padding:var(--ui-padding-4-8);
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        align-items: center;
        position: relative;
        gap: 6px;
        .iconBtn{
          width:var(--ui-size-16);
          height:var(--ui-size-16);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .checkbox{
          width:var(--ui-size-16);
          height:var(--ui-size-16);
          border: var(--ui-border-strong);
          border-radius: var(--ui-radius-sm);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          .el-icon{
            display: none;
          }
          &.active{
            border-color: var(--primary-color);
            background: var(--primary-color);
            .el-icon{
              display: flex;
              color: var(--ui-color-text-inverse);
            }
          }
          &.disabled{
            cursor:not-allowed;
            background-color: #eee;
            & + p{
              color: var(--ui-color-text-secondary);
              cursor:not-allowed;
            }
          }
        }
        p{
          flex: 1;
        }
        .fwb{
          font-weight: bold;
        }
        &:hover{
          background: #f8fafc;
        }
        &:focus-visible{
          border-radius: var(--ui-radius-sm);
          outline: 2px solid rgba(43, 92, 217, .18);
          outline-offset: -2px;
        }
        .tag{
          background: #1660f11a;
          color: var(--primary-color);
          font-size: 12px;
          height: var(--ui-size-22);
          border-radius: var(--ui-radius-11);
          padding: var(--ui-padding-0-8);
          line-height: 22px;
          display: inline-block;
        }
      }
    }
    .ul{
      margin-left:18px;
    }
  }
}

@media (max-width: 768px){
  .sceneBox-pup{
    gap: 8px;
    height: calc(100dvh - 178px);
    min-height: 360px;

    .scene-thead{
      align-items: stretch;
      flex-direction: column;
      gap: 8px;
      padding: var(--ui-padding-10-12);

      .scene-thead-title{
        h3{ font-size: 14px; }

        p{
          margin-top: 2px;
          line-height: 18px;
        }
      }

      .scene-thead-tag{
        width: 100%;
        padding: var(--ui-padding-3);

        .scene-thead-tag-item{
          flex: 1;
          min-width: 0;
          min-height: 36px;
        }
      }
    }

    .scene-thead-info{
      max-height: 90px;
      padding: var(--ui-padding-10-12);
      overflow-y: auto;
    }

    .scene-content{
      gap: 8px;

      .thead{
        display: none;
      }

      .scene-mobile-tabs{
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
        padding: var(--ui-padding-4);
        border-radius: var(--ui-radius-6);
        background: #edf1f7;

        button{
          min-height: 36px;
          padding: var(--ui-padding-0-8);
          border: 0;
          border-radius: var(--ui-radius-sm);
          color: var(--ui-color-neutral-700);
          background: transparent;
          touch-action: manipulation;

          span{
            display: inline-flex;
            min-width: 20px;
            height: var(--ui-size-20);
            margin-left: 4px;
            align-items: center;
            justify-content: center;
            border-radius: var(--ui-radius-xl);
            color: var(--primary-color);
            background: #e3ebff;
          }

          &.active{
            color: var(--primary-color);
            font-weight: 500;
            background: #fff;
          }

          &:focus-visible{
            outline: 2px solid rgba(43, 92, 217, .22);
          }
        }
      }

      .content{
        min-height: 0;
        overflow: hidden;
        padding: 0;
        background: transparent;

        >*{
          width: 100%;
          height: 100%;
          min-height: 0;
          overflow: hidden;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .content-hd{
          height: var(--ui-size-36);
          padding: 0;
          margin-bottom: 8px;
          border-bottom: 0;
          border-radius: var(--ui-radius-sm);
          background: transparent;

          :deep(.ivu-input-wrapper),
          :deep(.ivu-input){
            width: 100%;
          }

          :deep(.ivu-input){
            height: var(--ui-size-36);
            padding-top: 0;
            padding-bottom: 0;
            line-height: 34px;
          }

          :deep(.ivu-input-prefix){
            display: flex;
            height: var(--ui-size-36);
            align-items: center;
            justify-content: center;
            line-height: normal;
          }
        }

        .content-btn{
          min-height: 36px;
          padding: var(--ui-padding-0-8);
          margin-bottom: 0;
          border: var(--ui-border-subtle);
          border-bottom-color: #eee;
          border-radius: 6px 6px 0 0;
          background: #fff;

          >*{
            line-height: 20px;
          }

          >:not(p){
            flex: 0 0 auto;
          }

          p{
            min-width: 0;
            max-width: none;
            margin-right: auto;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .content-tbody{
          flex: 1;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch;
          border: var(--ui-border-subtle);
          border-top: 0;
          border-radius: 0 0 6px 6px;
          background: #fff;
        }

        .content-item{
          min-height: 52px;
          padding-right: 44px;

          .content-remove{
            width: var(--ui-size-36);
            height: var(--ui-size-36);
            opacity: 1;
          }
        }
      }
    }

    .scene-save-summary{
      flex-shrink: 0;
      min-height: 38px;
      padding: var(--ui-padding-8-10);

      p{
        line-height: 18px;

        strong{
          display: inline;
          margin-right: 6px;
        }
      }
    }
  }

  .content-tree{
    .ul{
      .li .li-hd{
        min-height: 36px;
        line-height: 28px;
        padding: var(--ui-padding-2-8);
      }

      .ul{
        margin-left: 14px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce){
  .sceneBox-pup{
    .scene-thead-tag-item,
    .content-remove{ transition: none; }
  }
}
</style>
