import {ref,onMounted,computed,shallowRef} from 'vue'
import { postApi } from "@/utils/api.js";
import { useUserStore } from '@/store/user.js'
import { useAppStore } from '@/store/app.js'
import { message } from '@/utils/message.js'
import i18n from '@/locales/index.js'
const { t } = i18n.global
const userStore = useUserStore()
const appStore = useAppStore()
const user = computed(() => userStore.user)
const loading=ref(false)
const data=ref({})
const initialFormSnapshot=ref('')
const loadingButton=ref(false)

const getSavePayload=(form={})=>({
   login_background:form.login_background || '',
   register_background:form.register_background || '',
   find_pwd_background:form.find_pwd_background || '',
   notice:form.notice || '',
   customer_link:form.customer_link || '',
   site_logo:form.site_logo || '',
   smtp_config:form.smtp_config || {},
   source_url:form.source_url || '',
})
const getFormSnapshot=(form={})=>JSON.stringify(getSavePayload(form))
const isDirty=computed(()=>!!initialFormSnapshot.value && getFormSnapshot(data.value) !== initialFormSnapshot.value)
const save=()=>{
   loadingButton.value=true
   const form=data.value
   postApi("/user/agentSite/edit",getSavePayload(form)).then(res=>{
      message(t('setting.saveSuccess'))
      getData()
      appStore.getConfig()
   }).catch(err=>{
      message(err?.msg, 'error')

   }).finally(()=>{
      loadingButton.value=false
   })
}
const isSmtpPass=ref(true)
const oldSmtpPass=ref('')
//获取页面数据
const getData = () => {
   loading.value=true
   isSmtpPass.value=true
   postApi("/user/agentSite/detail").then(res=>{
      data.value={
         ...res,
         smtp_config:{
            ...res?.smtp_config || {},
            smtp_port:String(res?.smtp_config?.smtp_port || ''),
         },
         smtp_test:'',
      }
      if(res?.smtp_config?.smtp_pass){
         oldSmtpPass.value=JSON.parse(JSON.stringify(res.smtp_config?.smtp_pass))
         isSmtpPass.value=true
      }else{
         oldSmtpPass.value=''
         isSmtpPass.value=false
      }
      initialFormSnapshot.value=getFormSnapshot(data.value)
   }).catch(err=>{
   }).finally(()=>{
      loading.value=false
   })
};

export {
   data,
   loading,
   loadingButton,
   isDirty,
   isSmtpPass,
   oldSmtpPass,
   getData,
   save,
}
