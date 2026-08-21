<template>
  <div class="appAuto certifyBox">
    <Spin size="large" fix :show="true" v-if="loading"></Spin>
    <template v-else-if="result.cert_type===-1">
        <NotVerification @startVerification="startVerification"/>
    </template>
    <template v-else-if="result.cert_type===0">
        <template v-if="result.attempt_active && diditUrl">
          <PersonalVerificationDidit  :data="result" v-model:url="diditUrl"  @getPersonalVerification="getPersonalVerification" @backBtn="()=>{
            result.last_session_status=''
            result.session_id=''
          }"/>
        </template>
        <template v-else>
          <PersonalVerification :data="result" :isBack="isBack" @setLevelBtn="setLevelBtn" @changeCertificationSubject="changeCertificationSubject"/>
        </template>
    </template>
    <template v-else-if="result.cert_type===1">
        <template v-if="result.application_status==='Draft'">
          <BusinessVerification ref="businessVerificationRef" :data="businessVerificationData" :isBack="isBack"  @handleReset="handleReset" @handleSubmit="getBusinessVerification"/>
        </template>
        <template v-else>
          <ResultBox :data="result" @recertification="recertification" @refreshStatus="getBusinessVerification"/>
        </template>
    </template>
  </div>
</template>

<script setup>
import {ref,onMounted,onBeforeUnmount,computed,reactive,nextTick} from 'vue'
import { levelMap } from '@/utils/level.js'
import { message,confirm,messageLoading,postApi,getApi,t } from '@/utils'
import NotVerification from './components/NotVerification/index.vue'
import PersonalVerification from './components/PersonalVerification/index.vue'
import PersonalVerificationDidit from './components/PersonalVerification/didit.vue'
import BusinessVerification from './components/BusinessVerification/index.vue'
import ResultBox from './components/ResultBox/index.vue'
import { useUserStoreRefs,useUserStore } from '@/utils/store'
const { user } = useUserStoreRefs()
const userStore = useUserStore()
const props = defineProps({

})
const loading=ref(false)
const isBack=ref(false)
const businessVerificationRef = ref(null)
//企业认证详情
const businessVerificationData=ref({})
//个人/企业认证状态 -1 未认证 0 个人认证 1 企业认证
const result=ref({
   cert_type:-1,
   last_session_level:0,
   last_session_remark:"",
   last_session_status:'',
   process:'',
   user_auth_level:0,
   user_auth_remark:'',
   user_auth_status:0,
   status:'',
   session_id:'',
   can_change_certification_subject:true,
})
//
let personalTimer=null
let personalPollingCount = 0;
let personalPollingActive = false;
const MAX_PERSONAL_POLLING = 200; // 最多轮询约 10 分钟
const clearPersonalTimer = () => {
  if (personalTimer) {
    clearTimeout(personalTimer);
    personalTimer = null;
  }
};
//循环个人认证
const loopPersonalVerification = (session_id) => {
   if (!session_id || !personalPollingActive) return;
   clearPersonalTimer();
   personalPollingCount = 0;
   const fetchStatus = () => {
      if (!personalPollingActive) return;
      getApi('/user/Certifications/getPersonalCertification', {
         session_id: session_id
      }).then(async (res) => {
         if (!personalPollingActive) return;
         personalPollingCount++;
         const { process } = res || {}
         result.value = {
            ...res,
            session_id: session_id,
         }
         // 让页面先出来，不再全局阻塞
         loading.value = false;

         // 防止无限轮询
         if (personalPollingCount > MAX_PERSONAL_POLLING) {
            localStorage.removeItem('SESSIONID');
            clearPersonalTimer();
            message(t('certify.authFail'), 'error')
            return;
         }
         // 轮询的是本次会话处理进度，不能再用“有效等级是否等于目标等级”
         // 判断完成，否则升级失败但旧等级继续有效时会永久轮询。
         if (personalPollingActive && ['waiting', 'doing'].includes(process)) {
            personalTimer = setTimeout(() => {
               fetchStatus();
            }, 3000)
            return;
         }
         // 刷新用户信息
         await userStore.getUserInfo()
         localStorage.removeItem("SESSIONID")
         clearPersonalTimer();
        result.value.session_id=''
      }).catch(() => {
         loading.value = false;
      })
   };
   // 立即发起第一次查询，不再白等5秒
   fetchStatus();
}
//个人认证
const getPersonalVerification = async () => {
   const sessionId = localStorage.getItem("SESSIONID")
   if (sessionId) {
      loopPersonalVerification(sessionId)
   } else {
      loading.value = true
      // 并发请求，提升一倍速度
      Promise.all([
         userStore.getUserInfo(),
         getApi('/user/Certifications/getPersonalCertification')
      ]).then(([_, res]) => {
         const { last_session_status, last_session_level, cert_type } = res || {}
         result.value = {
            ...res,
            // session_id:'',
            // cert_type:0,
            // last_session_status:'',
            // last_session_level:2,
            // user_auth_level:1,
            // user_auth_status:1,
            // process:'',
         }
         if (cert_type === -1) {
            loading.value = false
            localStorage.removeItem("SESSIONID")
            return
         }
         //如果有企业认证信息优先显示企业认证
         if (cert_type === 1) {
            getBusinessVerification()
            return
         } else if (cert_type === 0) {
            //判断是否认证失败
            if (last_session_level > 0) {
               if (!res?.review_locked && res?.attempt_active && res?.last_session_url && ['Not Started', 'In Progress', 'Awaiting User', 'Resubmitted'].includes(last_session_status)) {
                  confirm(t('certify.ongoingAuth', { level: levelMap.value[last_session_level]?.label }), { okText: t('certify.continueAuth'), cancelText: t('certify.laterAuth') }).then(() => {
                     diditUrl.value = res.last_session_url
                     window.location.href = res.last_session_url
                  })
               }
               loading.value = false
               return
            }
            loading.value = false
         }
      }).catch(() => {
         loading.value = false
      })
   }
}
//开始认证
const startVerification=(verificationType)=>{
   result.value.cert_type=verificationType
   isBack.value=true
   if(verificationType===1){
      getBusinessVerification()
   }else{
      result.value.status="Active"
   }
}
const changeCertificationSubject=()=>{
   result.value.cert_type=-1
   isBack.value=false
}
//选择认证
const diditUrl=ref('')
const personalSessionStarting=ref(false)
const setLevelBtn=async (level)=>{
   if(result.value.cert_type!==0){
      return
   }
  if (result.value.review_locked) {
    message(result.value.review_remark || t('certify.personalAttemptPendingReview'), 'warning')
    return
  }
  const resumableSessionStatuses = ['Not Started', 'In Progress', 'Awaiting User', 'Resubmitted']
  if (
    result.value.attempt_active
    && Number(level) === Number(result.value.last_session_level)
    && result.value.last_session_url
    && resumableSessionStatuses.includes(result.value.last_session_status)
  ) {
    window.location.href = result.value.last_session_url
    return
  }
  if (personalSessionStarting.value) {
    return
  }
  personalSessionStarting.value = true
  let loadingInstance = null
  //获取域名
  const redirect_url = `${window.location.origin}/certify`
  try {
    if (Boolean(result.value.can_change_certification_subject)) {
      const confirmed = await confirm(t('certify.personalCertificationStartTypeLockConfirm'), {
        okText: t('certify.continueAuth'),
        resolveCancel: true,
      })
      if (!confirmed) {
        return
      }
    }
    loadingInstance=messageLoading(t('authLevel.loadingPlatform'))
    const res = await postApi('/user/Certifications/personalCertification',{
      auth_level:level,
      redirect_url:redirect_url,
    })
    if (!res?.url) {
      throw new Error(t('authLevel.unknownError'))
    }
    localStorage.setItem("SESSIONID",res.session_id)
    window.location.href = res.url
  } catch (err) {
    message(err?.msg || err?.message || err || t('authLevel.unknownError'),'error')
  } finally {
    loadingInstance?.()
    personalSessionStarting.value = false
  }
}
//企业认证
const getBusinessVerification= (options = {})=>{
   loading.value=true
   return getApi('/user/certifications/getFields').then((res)=>{
      if (options?.preserveStepKey) {
         res.preferred_step_key = options.preserveStepKey
      }
      businessVerificationData.value=res
      const certification = res?.certification || {}
      const isVerifiedCompany = Number(user.value.auth_status) === 1
         && Number(user.value.auth_type) !== 0
      const fallbackStatus = isVerifiedCompany ? 'Active' : 'Draft'
      result.value = {
         ...result.value,
         ...certification,
         cert_type: (res?.certification || isVerifiedCompany) ? 1 : result.value.cert_type,
         type: 1,
         effective_status: certification.effective_status || certification.status || fallbackStatus,
         application_status: certification.application_status || certification.status || fallbackStatus,
         status: certification.application_status || certification.status || fallbackStatus,
         remark: certification.remark || '',
         persons: res?.persons || [],
      }
   }).finally(()=>{
      loading.value=false
   })
}
//重新开始认证
const recertification=async ()=>{
   if (result.value.cert_type !== 1) {
      result.value.status="Draft"
      setLevelBtn(result.value.last_session_level)
      return
   }
   loading.value = true
   try {
      await postApi('/user/certifications/startCompanyCertificationRenewal')
      businessVerificationRef.value?.clearCurrentCache?.()
      await getBusinessVerification()
      message(t('certify.renewalStarted'))
   } catch (err) {
      message(err?.msg || err || t('certify.operationFailed'), 'error')
   } finally {
      loading.value = false
   }
}
//清空认证
const handleReset=()=>{
   confirm(t('certify.resetConfirm'))
      .then(()=>{
         postClearCertification()
      })
}
//更换用户认证类型
const postClearCertification=()=>{
   postApi('/user/certifications/clearCertification')
      .then((res)=>{
         businessVerificationRef.value?.clearCurrentCache?.()
         result.value.cert_type=-1
      })
      .catch((err)=>{
         message(err?.msg || err || t('authLevel.unknownError'),'error')
      })
      .finally(()=>{
         loading.value=false
      })
}
//初始化认证
const getInit=async ()=>{
  loading.value=true
   if(!user.value?.id){
      await userStore.getUserInfo()
   }
   if(Number(user.value.auth_status) === 1 && Number(user.value.auth_type) !== 0){
      //企业认证
      await getBusinessVerification()
   }else{
      getPersonalVerification()
   }
}
onMounted(() => {
   personalPollingActive = true
   getInit()

})
onBeforeUnmount(() => {
   personalPollingActive = false
   clearPersonalTimer()
})
</script>

<style scoped lang="less">
.certifyBox{
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 600px;
  padding: var(--ui-padding-0-16);
  .page-center{
    width: 100%;
  }
}
@media (max-width: 768px) {
  .certifyBox{
    padding: var(--ui-padding-0-8);
  }
}
</style>
