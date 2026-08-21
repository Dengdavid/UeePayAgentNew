//消息框
import { message,confirm,messageLoading } from '@/utils//message.js'
//api
import { postApi,getApi } from '@/utils/api.js'
//多语言
import i18n from '@/locales/index.js'
const t=i18n.global.t

export { message, confirm,messageLoading,postApi,getApi,t }
