import { useUserStoreRefs,useAppStoreRefs } from '@/utils/store'
const { user } = useUserStoreRefs()
import { message,messageLoading,postApi } from '@/utils'
import {ref,computed} from 'vue'
import i18n from '@/locales/index.js'
export {
  user
}
//当前认证等级
export const authLevel=()=> {
  return user.value.auth_level || 0
}
//可认证次数
export const authRemainingTimes = () => {
  return user.value.auth_remaining_times || 0
}
export const levelMap = computed(() => {
  const t=i18n.global.t
  return {
    '1': {
      label: t('authLevel.level1.label'),
      type:'success',
      tabs: t('authLevel.level1.tabs'),
      desc: t('authLevel.level1.desc'),
      desc1: t('authLevel.level1.desc1'),
      desc2: t('authLevel.level1.desc2'),
      color:'#6EB846',
      icon:'icon-wodezhengjian'
    },
    '2': {
      label: t('authLevel.level2.label'),
      type:'success',
      tabs: t('authLevel.level2.tabs'),
      desc: t('authLevel.level2.desc'),
      desc1: t('authLevel.level2.desc1'),
      desc2: t('authLevel.level2.desc2'),
      color:'#6EB846',
      icon:'icon-renlianshibie'
    },
    '3': {
      label: t('authLevel.level3.label'),
      type:'success',
      tabs: t('authLevel.level3.tabs'),
      desc: t('authLevel.level3.desc'),
      desc1: t('authLevel.level3.desc1'),
      desc2: t('authLevel.level3.desc2'),
      color:'#6EB846',
      icon:'icon-shouhuodizhi'
    },
  }
});
//去认证
export const goLevel =async (level,buttonLoading=ref(false),personalVerificationDiditUrl=ref(''))=>{
  removeAuthLevel()
  const { t } = i18n.global;
  //获取域名
  const redirect_url = `${window.location.origin}/certify`
  const loadingInstance=messageLoading(t('authLevel.loadingPlatform'))
  buttonLoading.value=true
  await postApi('/user/Certifications/personalCertification',{
   auth_level:level,
   redirect_url:redirect_url,
  })
   .then((res)=>{
     personalVerificationDiditUrl.value=res.url
   })
   .catch(err=>{
      message(err?.msg || err || t('authLevel.unknownError'),'error')
   }).finally(()=>{
      loadingInstance()
      buttonLoading.value=false
   })
}

