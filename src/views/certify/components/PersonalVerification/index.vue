<template>
   <div class="page-center individual">
      <PageTitle :title="`${$t('certify.personal')}${$t('menu.certify')}`">
        <template #subtitle>
          <div class="header-subtitle">
            <p>{{ $t('certify.levelUpgradeTip') }}</p>
          </div>
        </template>
      </PageTitle>
      <template v-if="data.review_locked || data.attempt_pending_review">
        <Alert class="alertBox" type="warning" show-icon>
          {{ data.review_remark || data.last_session_remark || $t('certify.personalAttemptPendingReview') }}
        </Alert>
      </template>
      <template v-else-if="data.last_session_status === 'In Review' && (data.review_remark || data.last_session_remark)">
        <Alert class="alertBox" type="warning" show-icon>
          {{ data.review_remark || data.last_session_remark }}
        </Alert>
      </template>
      <template v-else-if="!(['In Review', 'In Progress'].includes(data.last_session_status) || ['waiting', 'doing'].includes(data.process))">
          <template v-if="data.review_remark">
            <Alert class="alertBox" type="error" show-icon>{{ data.review_remark }}</Alert>
          </template>
          <template v-else-if="data.user_auth_remark && data.user_auth_status===0">
            <Alert class="alertBox" type="error" show-icon>{{ data.user_auth_remark }}</Alert>
          </template>
          <template v-else-if="data.last_session_remark">
            <Alert class="alertBox" type="error" show-icon>{{ data.last_session_remark }}</Alert>
          </template>
      </template>
      <div class="individual-list">
         <div class="individual-item" :class="levelObj(level,data).class"  v-for="(item,level) in levelMap" :key="level">
            <div class="auth-label">
               <span>{{ levelObj(level,data).text }}</span>
               <Tooltip v-if="levelRemark(level,data)" transfer placement="bottom-end" :max-width="320">
                  <Icon class="auth-reason-icon" type="md-information-circle" @click.stop="showLevelRemark(level,data)" />
                  <template #content>
                     <div class="auth-reason-content">{{ levelRemark(level,data) }}</div>
                  </template>
               </Tooltip>
            </div>
            <div class="thead">
               <div class="iconfont" :class="item.icon"></div>
            </div>
            <div class="auth list-b-4">
               <h3>{{ item.label }}</h3>
               <div class="tabs">
                  <Tag :color="levelObj(level,data).type" v-for="(value,index) in item.tabs?.split(',') || []" :key="index">{{ value }}</Tag>
               </div>
            </div>
            <div class="desc">{{ item.desc }}</div>
            <div class="info-list list-b-4">
               <dl>
                  <dt class="iconfont icon-suoding"></dt>
                  <dd>{{ item.desc1 }}</dd>
               </dl>
                <dl>
                  <dt class="iconfont icon-yinhangka"></dt>
                  <dd>{{ item.desc2 }}</dd>
               </dl>
            </div>
            <template v-if="levelObj(level,data).isCard">
               <router-link :to="{ name: 'cardAdd' }">
                  <Button type="success"  size="default" long >
                     <span>{{ $t('button.openCardNow') }}</span>
                     <Icon type="md-arrow-forward" />
                  </Button>
               </router-link>
            </template>
            <template v-else>
               <Button type="primary"  size="default" long :disabled="disabledBtn(level,data)"  @click="setLevelBtn(level)">
                 <span>{{ textBtn(level,data) }}</span>
                  <Icon type="md-arrow-forward" />
               </Button>
            </template>
         </div>
      </div>
      <div class="list-b-8 flex-column-center-center">
         <div class='ui-text-grey authRemainingTimesBox text-center'>
            <span class="iconfont icon-shenjizhuizong"></span>
            <span v-html="$t('certify.remainingTimes', { times: remainingTimes(data) })"></span>
            <a class="link" @click="changeCertificationSubject" v-if="canChangeCertificationSubject">{{ $t('certify.changeCertificationSubject') }}</a>
            <Divider type="vertical" />
            <p class="ui-text-grey">{{ $t('certify.authSafeTip') }}</p>
         </div>
      </div>
      <div class="presentsBox">
         <div class="presentsBox-list">
            <dl v-for="(item,key) in presents" :key="key">
               <dt>
                  <div class="iconfont" :class="item.icon"></div>
               </dt>
               <dd>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.desc }}</p>
               </dd>
            </dl>
         </div>
      </div>
   </div>
</template>

<script setup>
import { authLevel,levelMap,authRemainingTimes } from '@/utils/level.js'
import { message,t } from '@/utils'
import { computed } from 'vue'

import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user.js'
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const emit=defineEmits(['setLevelBtn', 'changeCertificationSubject'])
const resumableSessionStatuses = ['Not Started', 'In Progress', 'Awaiting User', 'Resubmitted']
const isReviewLocked = (result = {}) => [true, 1, '1'].includes(result.review_locked)
const isCurrentAttemptLevel = (level, result = {}) => Number(level) === Number(result.last_session_level)
const isEnabledFlag = (value) => [true, 1, '1'].includes(value)
const levelAttempt = (level, result = {}) => {
   const attempts = result?.level_attempts
   if (!attempts || typeof attempts !== 'object') {
      return null
   }
   return attempts[String(Number(level))] || null
}
const levelRemark = (level, result = {}) => String(levelAttempt(level, result)?.remark || '').trim()
const showLevelRemark = (level, result = {}) => {
   const remark = levelRemark(level, result)
   if (remark) {
      message(remark, 'error')
   }
}
const isResumableAttempt = (level, result = {}) => {
   const attempt = levelAttempt(level, result)
   if (attempt) {
      return !isReviewLocked(result)
         && !isEnabledFlag(attempt.review_locked)
         && isEnabledFlag(attempt.active)
         && resumableSessionStatuses.includes(attempt.session_status)
   }
   return !isReviewLocked(result)
      && result.attempt_active
      && isCurrentAttemptLevel(level, result)
      && resumableSessionStatuses.includes(result.last_session_status)
}
const isAwaitingPlatformReview = (result = {}) => {
   return [true, 1, '1'].includes(result.attempt_pending_review)
      || (result.last_session_status === 'Approved' && result.attempt_platform_status === 'Pending')
}
const isLevelAwaitingPlatformReview = (level, result = {}) => {
   const attempt = levelAttempt(level, result)
   if (attempt) {
      return isEnabledFlag(attempt.review_locked)
         || (attempt.platform_status === 'Pending'
            && ['Approved', 'In Review'].includes(attempt.session_status))
   }
   return isCurrentAttemptLevel(level, result)
      && (isAwaitingPlatformReview(result) || result.last_session_status === 'In Review')
}
const setLevelBtn=(level)=>{
   if(isReviewLocked(props.data)){
       message(props.data.review_remark || t('certify.personalAttemptPendingReview'),'warning')
       return
   }
   if(!isResumableAttempt(level, props.data) && remainingTimes(props.data)<=0){
       message(t('certify.authTimesEmptyAlert'),'error')
       return
   }
   emit('setLevelBtn',level)
}

const remainingTimes=(result={})=>{
   const value = result?.auth_remaining_times
   return value === null || value === undefined || value === ''
      ? Number(authRemainingTimes())
      : Number(value)
}

const hasEffectiveCertification=(result={})=>{
   return Number(result.effective_level ?? result.user_auth_level ?? 0) > 0
      && (result.effective_status === true
         || result.effective_status === 1
         || result.effective_status === 'Active'
         || Number(result.user_auth_status) === 1)
}

const levelObj=(level,result)=>{
   if(Number(level)<=Number(result.effective_level ?? result.user_auth_level ?? 0) && hasEffectiveCertification(result)){
      return {
         class:'is-auth',
         text:t('certify.statusPass'),
         type:'success',
         isCard:true
      }
   }
  const attempt = levelAttempt(level, result)
  if(attempt?.platform_status === 'Inactive'){
    return {
      class:'is-failed',
      text:t('certify.statusReject'),
      type:'error'
    }
  }
  if(isLevelAwaitingPlatformReview(level, result)){
    return {
      class:'is-processing',
      text:t('certify.waitingForReview'),
      type:'warning'
    }
  }
  if(attempt?.platform_status === 'Active'){
    return {
      class:'is-auth',
      text:t('certify.statusPass'),
      type:'success'
    }
  }
  if(['Not Started', 'Awaiting User'].includes(attempt?.session_status)){
    return {
      class:'is-processing',
      text:t('certify.waitingForAuthentication'),
      type:'primary'
    }
  }
  if(isEnabledFlag(attempt?.active)){
    return {
      class:'is-processing',
      text:t('certify.authenticating'),
      type:'primary'
    }
  }
  if(!attempt && isReviewLocked(result) && isCurrentAttemptLevel(level, result)){
      return {
         class:'is-processing',
         text:t('certify.waitingForReview'),
         type:'warning'
      }
   }
  if(result.attempt_platform_status === 'Inactive' && isCurrentAttemptLevel(level, result)){
    return {
      class:'is-failed',
      text:t('certify.statusReject'),
      type:'error'
    }
  }
  if(isAwaitingPlatformReview(result) && isCurrentAttemptLevel(level, result)){
    return {
      class:'is-processing',
      text:t('certify.waitingForReview'),
      type:'warning'
    }
  }
  if(result.last_session_status === 'In Review' && isCurrentAttemptLevel(level, result)){
    return {
      class:'is-processing',
      text:t('certify.review'),
      type:'primary'
    }
  }
  if(['Not Started', 'Awaiting User'].includes(result.last_session_status) && isCurrentAttemptLevel(level, result)){
      return {
        class:'is-processing',
        text:t('certify.waitingForAuthentication'),
        type:'primary'
      }
  }
  if(result.attempt_active && isCurrentAttemptLevel(level, result)){
      return {
        class:'is-processing',
        text:t('certify.authenticating'),
        type:'primary'
      }
  }
  return {
    text:t('certify.statusUnauth'),
    type:'default'
  }
}
//按钮名称
const textBtn=(level,result)=>{
 const effectiveLevel = Number(result.effective_level ?? result.user_auth_level ?? 0)
 const currentLevel = Number(level)
 const attempt = levelAttempt(level, result)
 if (isReviewLocked(result)) {
    return t('certify.waitingForReview')
 }else if (isResumableAttempt(level, result)) {
    return t('certify.continueAuth')
  }else if (remainingTimes(result) <= 0) {
     return t('certify.authTimesEmpty')
  }else if(isLevelAwaitingPlatformReview(level, result)){
     return t('certify.waitingForReview')
  }else if((isEnabledFlag(attempt?.terminal)
      || (result.attempt_terminal && currentLevel===Number(result.last_session_level)))
    && currentLevel>effectiveLevel){
    return t('certify.retryAuth')
  }else if(effectiveLevel>0 && currentLevel>effectiveLevel){
    return t('certify.upgradeAuth')
  }else{
    return t('certify.authNow')
  }
}
const disabledBtn=(level,result={})=>{
  /// Not Started 未开始,In Progress 进行中,In Review 审核中,Approved 已通过,Declined 已拒绝,Abandoned 已放弃,Expired 已过期
  //认证次数为0，禁用按钮
  if (isReviewLocked(result)) {
      return true
  }
  if (isResumableAttempt(level, result)) {
      return false
  }
  if (remainingTimes(result) <= 0) {
      return true
  }
  if (isLevelAwaitingPlatformReview(level, result)) {
      return true;
  }
  const attempt = levelAttempt(level, result)
  if (attempt && isEnabledFlag(attempt.active)) {
      return true
  }
  if (result.attempt_active && isCurrentAttemptLevel(level, result)) {
      return true
  }
  return false
}
const props=defineProps({
   data: {
      type:Object,
      default:()=>{
         return {}
      }
   },
})
const hasStartedCertification = computed(() => {
   const result = props.data || {}
   const hasAttempt = ['attempt_active', 'attempt_terminal', 'attempt_pending_review']
      .some((key) => [true, 1, '1'].includes(result[key]))
   return Number(result.effective_level ?? result.user_auth_level ?? 0) > 0
      || Number(result.last_session_level ?? 0) > 0
      || hasAttempt
})
const canChangeCertificationSubject = computed(() => (
   Boolean(props.data?.can_change_certification_subject)
   && !hasStartedCertification.value
))
const presents=[
   {
      icon: 'icon-shujukujiami',
      get title() { return t('certify.presents.dataSecurity') },
      get desc() { return t('certify.presents.dataSecurityDesc') }
   },
   {
      icon: 'icon-shujuanquan',
      get title() { return t('certify.presents.compliance') },
      get desc() { return t('certify.presents.complianceDesc') }
   },
   {
      icon: 'icon-eye-close',
      get title() { return t('certify.presents.privacy') },
      get desc() { return t('certify.presents.privacyDesc') }
   },
   {
      icon: 'icon-yonghuquanxianshezhiquanxian',
      get title() { return t('certify.presents.dataControl') },
      get desc() { return t('certify.presents.dataControlDesc') }
   }
]
const changeCertificationSubject=()=>{
   emit('changeCertificationSubject')
}
</script>

<style scoped lang="less">
.alertBox{
  width: 100%;
  max-width: 1100px;
}
.individual{
   gap:24px;
   padding: 32px 0;
   margin: 0 auto;
   display: flex;
   flex-direction: column;
   align-items: center;
   user-select: none;
   .header-subtitle{
      text-align: center;
      p{
         font-size:14px;
         font-weight: normal;
         color: var(--ui-color-text-subtle);
      }
   }
   .individual-list{
      display: flex;
      flex-wrap: wrap;
      gap:24px;
      max-width:1100px;
      .individual-item{
         flex: 1;
         min-width:240px;
         border: var(--ui-border-subtle);
         border-radius: var(--ui-radius-lg);
         padding:24px 24px;
         display: flex;
         flex-direction: column;
         gap:16px;
         position: relative;
         cursor: pointer;
         box-shadow: 0 6px 12px 0 rgba(117, 120, 127, 0.15);
         overflow: hidden;
         &:hover{
            border-color: var(--primary-color);
            background: #fafbff;
            .thead{
               .iconfont{
                  background-color: var(--primary-color);
                  color: var(--ui-color-text-inverse);
               }
            }
            .auth-label{
               background-color: var(--primary-color);
               color: var(--ui-color-text-inverse);
            }
         }
         .thead{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap:8px;
            .tag{
               background-color: #eee;
               border-radius:var(--ui-radius-full);
               padding: var(--ui-padding-2-8);
            }
            .iconfont{
               width:var(--ui-size-44);
               height:var(--ui-size-44);
               border-radius: var(--ui-radius-circle);
               display: flex;
               align-items: center;
               justify-content: center;
               background-color: #dcdcdc;
               font-size: 18px;
               color: var(--ui-color-text-inverse);
            }
         }
         &.is-processing{
            border-color: var(--primary-color);
            background: #fafbff;
            .thead{
               .iconfont{
                  background-color: var(--primary-color);
                  color: var(--ui-color-text-inverse);
               }
            }
            .info-list{
               .iconfont{
                  color: var(--primary-color);
               }
            }
            .auth-label{
               background-color: var(--primary-color);
               color: var(--ui-color-text-inverse);
            }
         }
         &.is-auth{
            border-color:var(--ui-color-success);
            background: #f9fbf9;
            .thead{
               .iconfont{
                  background-color: var(--ui-color-success);
                  color: var(--ui-color-text-inverse);
               }
            }
            .info-list{
               .iconfont{
                  color: var(--ui-color-success);
               }
            }
            .auth-label{
               background-color: var(--ui-color-success);
               color: var(--ui-color-text-inverse);
            }
         }
         &.is-failed{
            border-color:#ffb7ad;
            background:#fff8f7;
            .thead .iconfont,
            .auth-label{
               background-color:#ed4014;
               color:#fff;
            }
            .info-list .iconfont{
               color:#ed4014;
            }
         }
         .info-list{
            display: flex;
            flex-direction: column;
            gap:4px;
            border-top: 1px #eee solid;
            padding-top: 16px;
            dl{
               display: flex;
               align-items: center;
               gap:8px;
               dt{
                  width:var(--ui-size-16);
                  height: var(--ui-size-16);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  &.icon-yinhangka{
                     font-size: 12px;
                  }
               }
            }
         }
         .auth-label{
            display: flex;
            align-items: center;
            gap:4px;
            position: absolute;
            top: 0;
            right: 0;
            padding: var(--ui-padding-2-8);
            background-color: #dcdcdc;
            color: var(--ui-color-text-secondary);
            border-radius: 0 4px 0 4px;
            .auth-reason-icon{
               font-size:14px;
               cursor: help;
            }
         }
         .desc{
            flex: 1;
            text-align: left;
            color: var(--ui-color-text-secondary);
         }
      }
   }
   .authRemainingTimesBox{
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap:8px;
      padding:var(--ui-padding-4-16);
      border: var(--ui-border-subtle);
      border-radius:var(--ui-radius-full);
      background: #fafafa;
   }
}
.presentsBox{
   width: 100%;
   .presentsBox-list{
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap:24px;
      padding: var(--ui-padding-24);
      border-radius: var(--ui-radius-lg);
      max-width:1100px;
      border: var(--ui-border-subtle);
      box-shadow: 0 6px 12px 0 rgba(117, 120, 127, 0.15);
      background: linear-gradient(-180deg, #fff 60%, #f5f9ff 100%);
      dl{
         flex: 1;
         min-width:220px;
         display: flex;
         gap:14px;
         dt{
            width:var(--ui-size-48);
            height:var(--ui-size-48);
            border-radius: var(--ui-radius-circle);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--ui-color-text-inverse);
            background:#f1f3f9;
            .iconfont{
               font-size:20px;
               color: var(--primary-color);
            }
         }
         dd{
            flex: 1;
            overflow: hidden;
            p{
               margin-top:4px;
               color: var(--ui-color-text-secondary);
               line-height: 1.2;
            }
         }
      }
   }

}
.auth-reason-content{
   max-width:320px;
   white-space:normal;
   line-height:1.5;
   word-break:break-word;
}
</style>
