<template>
  <UiPage ref="pageRef" :data="data" row-key="id">
    <template #item="{item}">
      <div class="message-box"  @click="handleGoDetail(item)">
        <div class="message-box-tbody">
          <div class="icon" :style="getMsgIcon(item).style">
            <Badge :dot="item.status == 0">
              <i  :class="getMsgIcon(item).icon"  />
            </Badge>
          </div>
          <div class="center list-b-4">
            <div class="thead">
              <h3 class="title">{{ item.title }}</h3>
              <div class="btns" v-if="!isPhone">
                <Icon
                  class="delete"
                  type="md-trash"
                  :size="16"
                  @click.stop="handleDelete(item)"
                />
              </div>
            </div>
            <div class="content"  v-html="item.content"></div>
            <div class="time">{{ item.created_at }}</div>
          </div>
        </div>
        <div class="message-box-bottons" v-if="isPhone">
          <Button type="text" icon="md-checkmark-circle-outline" :loading="item.loading" class="btn" @click.stop="handleGoDetail(item)" v-if="item.status==0">{{ $t('messageCenter.markRead') }}</Button>
          <Button type="text" icon="md-trash" :loading="item.loadingDelete" class="btn" @click.stop="handleDelete(item)">{{ $t('messageCenter.delete') }}</Button>
        </div>
      </div>
    </template>
    <template #pup>
      <PupMessage ref="ref_pup_message"/>
    </template>
  </UiPage>
</template>

<script setup>
import { computed, ref,reactive } from 'vue'
import { useUserStore } from '@/utils/store.js'
const userStore = useUserStore()
import { getApi,postApi } from '@/utils/api.js'
import { message,confirm } from '@/utils/message.js'
import { isPhone } from '@/utils/device.js'
import { t } from '@/utils'
const pageRef=ref(null)
const data=reactive({
    apiUrl:'/user/message',
    statusKey:'status',
    status:[
      {
        label: t('messageCenter.all'),
        value:''
      },
      {
        label: t('messageCenter.unread'),
        value:0
      },
      {
        label: t('messageCenter.read'),
        value:1
      },
    ],
    btns:[
      {
        label: t('messageCenter.markAllRead'),
        icon:'md-checkmark-circle',
        click:()=>{
          handleReadAll()
        }
      },
      {
        label: t('messageCenter.notificationSettings'),
        icon:'md-settings',
        click:()=>{
          openPupMessage()
        }
      },
    ]
})
//消息预警
import PupMessage from '@/views/ucenter/components/PupMessage.vue'
const ref_pup_message = ref()
const openPupMessage=()=>{
  ref_pup_message.value?.open?.()
}
const buttonLoading=ref(false)
const getConfirmOptions=()=>({
  title: t('messageCenter.confirmTitle'),
  okText: t('button.confirm'),
  cancelText: t('button.cancel'),
})
const getMsgIcon=(item)=>{
  if (item.type === 'card') {
    return {
      icon:'iconfont icon-yinhangka-m',
      style:{
        color:'#fff',
        background:'linear-gradient(135deg, #33D18C 0%, #00B578 100%)',
        boxShadow:'0 4px 8px rgba(0, 181, 120, 0.25)'
      }
    }
  }
  if (item.type === 'wallet') {
    return {
      icon:'iconfont icon-feiyong',
      style:{
        color:'#fff',
        background:'linear-gradient(135deg, #FFBC3D 0%, #FF9500 100%)',
        boxShadow:'0 4px 8px rgba(255, 149, 0, 0.25)'
      }
    }
  }
  return {
    icon:'ivu-icon ivu-icon-md-notifications',
    style:{
      color:'#fff',
      background:'linear-gradient(135deg, #4DA1FF 0%, #1677FF 100%)',
      boxShadow:'0 4px 8px rgba(22, 119, 255, 0.25)'
    }
  }
}
//查看消息
const handleGoDetail=(item)=>{
  if (item.status === 0) {
    item.loading=true
    getApi('/user/viewMessage',{id:item.id})
      .then((res)=>{
        item.status=1
        message(t('messageCenter.markSuccess'))
        userStore.getMessageNum()
      })
      .catch((err) => {
        message(err?.msg || t('messageCenter.markFailed'), 'error')
      })
      .finally(()=>{
        item.loading=false
      })
  }
}
//删除消息
const handleDelete=(item)=>{
  confirm(t('messageCenter.deleteConfirm'), getConfirmOptions()).then(()=>{
    item.loadingDelete=true
    postApi('/user/batchMessage',{id:[item.id]})
      .then((res)=>{
        message(t('messageCenter.deleteSuccess'))
        userStore.getMessageNum()
        pageRef.value?.reset?.()
      })
      .catch((err) => {
        message(err?.msg || t('messageCenter.deleteFailed'), 'error')
      })
      .finally(()=>{
        item.loadingDelete=false
      })
  })
}
//全部标记为已读
const handleReadAll=()=>{
  confirm(t('messageCenter.markAllConfirm'), getConfirmOptions()).then(()=>{
    buttonLoading.value=true
    postApi('/user/readAllMessage')
      .then((res)=>{
        message(t('messageCenter.markAllSuccess'))
        userStore.getMessageNum()
        pageRef.value?.reset?.()
      })
      .catch((err) => {
        message(err?.msg || t('messageCenter.operationFailed'), 'error')
      })
      .finally(()=>{buttonLoading.value=false})
  })
}
</script>

<style scoped lang="less">
.message-box{
  background-color: #fcfcfc;
  border-radius:var(--ui-radius-sm);
  box-sizing: border-box;
  border: 1px #fcfcfc solid;
  position: relative;
  overflow: hidden;
  .message-box-tbody{
    padding:var(--ui-padding-12);
    display: flex;
    gap: 16px;
    .icon{
      width:var(--ui-size-36);
      height:var(--ui-size-36);
      font-size:24px;
      background: #f0f3fa;
      border-radius: var(--ui-radius-circle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }
    .center{
      flex: 1;
    }
  }
  .message-box-bottons{
    background: #fff;
    border-top: 1px #eee solid;
    display: flex;
    >*{
      line-height: 38px;
      flex: 1;
      text-align: center;
      color: var(--ui-color-text) !important;
      border-radius: 0 !important;
      &:not(:last-child){
        border-right: 1px #eee solid !important;
      }
    }
  }
  .dot{
    position: absolute;
    left: 6px;
    top: 21px;
    display: block;
    width: var(--ui-size-6);
    height: var(--ui-size-6);
    background-color: red;
    border-radius: var(--ui-radius-circle);
  }
  .thead{
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title{
      font-size: 14px;
      font-weight: 600;
      flex: 1;
      line-height: 24px;
    }
    .btns{
      cursor: pointer;
      display: none;
      .ivu-icon{
        width:var(--ui-size-24);
        height:var(--ui-size-24);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-color-neutral-550);
        border-radius: var(--ui-radius-full);
        @media (hover: hover) and (min-width: 769px) {
          &:hover{
            color: var(--ui-color-text-inverse);
            background:var(--error-color);
          }
        }
      }
    }
  }
  .time{
    font-size: 12px;
    color: var(--ui-color-neutral-550);
  }
  @media (hover: hover) and (min-width: 769px) {
    &:hover{
      .thead{
        .btns{
          display: flex;
        }
      }
      background-color: #f8f9fd;
      border-color: var(--primary-color);
    }
  }
  @media screen and (max-width: 768px) {
    border-color:#eee;
    background: #fff;
    .thead{
      .btns{
        display: flex;
      }
    }
  }
}
</style>
