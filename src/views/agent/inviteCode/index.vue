<template>
  <CardBox :loading="loading">
    <div class="agentInviteCodes" v-if="agentInviteCodes?.[0]?.invite_codes?.length>0">
        <template v-for="item in agentInviteCodes">
           <FormCell :title="item.site_name">
              <div class="agentInviteCodes-item" v-for="codeRow in item.invite_codes">
                <div class="hd">{{ codeRow.group_title }}</div>
                <div class="content">
                  <p>{{ getCode(item,codeRow) }}</p>
                </div>
                <div class="copy" @click="copyText(getCode(item,codeRow))">
                   <p>{{ $t('agent.invite.copy') }}</p>
                </div>
              </div>
           </FormCell>
        </template>
      </div>
      <p class="notData" v-else>{{ $t('agent.invite.empty') }}</p>
  </CardBox>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {  Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { getApi } from '@/utils/api.js'
import { copyText } from '@/utils/dataInfo.js'
const getCode=(item,codeRow)=>{
  return `${item.site_protocol}://${item.site_domain}/register?invite_code=${codeRow.invite_code}`
}
const loading=ref(false)
const agentInviteCodes=ref([])
const getAgentInviteCodes=()=>{
  loading.value=true
  getApi('/user/agentInviteCodes').then((res) => {
      agentInviteCodes.value=res
  }).catch((err)=>{
    message(err, 'error')
  }).finally(() => {
    loading.value=false
  });
}

onMounted(() => {
  getAgentInviteCodes()
})
</script>

<style scoped lang="less">
.agentInviteCodes{
  .agentInviteCodes-item{
    display: flex;
    border: var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    overflow: hidden;
    &:not(:last-child){
      margin-bottom: 12px;
    }
    >*{
      padding:var(--ui-padding-8-16);
      &:not(:last-child){
        border-right: 1px #eee solid;
      }
    }
    .hd{
      width: var(--ui-size-100);
      text-align: center;
      background: #fafafa;
    }
    .content{
      flex: 1;
      overflow: hidden;
    }
    .copy{
      width:var(--ui-size-80);
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      &:hover{
        background: var(--primary-color);
        color: var(--ui-color-text-inverse);
      }
    }
  }
}
</style>
