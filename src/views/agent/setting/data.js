import { ref } from 'vue'
import { getApi,postApi } from '@/utils/api.js'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
const loading=ref(false)
const getInfo=()=>{
  loading.value=true
  getApi('/user/agentInviteCodes').then((res) => {
  }).catch((err)=>{
    message(err, 'error')
  }).finally(() => {
    loading.value=false
  });
}
export {getInfo,loading}
