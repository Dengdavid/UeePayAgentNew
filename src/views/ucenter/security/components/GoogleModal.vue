<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
      <div class="googleModal">
        <UiStep :data="steps" :loading="loading" :lastText="$t('security.google.bind')" @nextStep="nextStep" @finish="finish">
          <template #step1>
            <div class="googleModalBox">
              <div class="tip">{{ $t('security.google.downloadTip') }}</div>
              <div class="ewms">
                <div class="ewms-item">
                  <div class="ewms-box">
                    <img
                      src="@/assets/images/android.png"
                      :alt="$t('security.google.android')"
                      class="app-qrcode"
                    />
                  </div>
                  <p>{{ $t('security.google.android') }}</p>
                </div>
                <div class="ewms-item">
                  <div class="ewms-box">
                    <img
                      src="@/assets/images/ios.png"
                      :alt="$t('security.google.ios')"
                      class="app-qrcode"
                    />
                  </div>
                  <p>{{ $t('security.google.ios') }}</p>
                </div>
              </div>
              <div class="tip">{{ $t('security.google.scanDownload') }}</div>
            </div>
          </template>
          <template #step2>
            <div class="googleModalBox">
              <div class="tip list-b-3">
                <p>{{ $t('security.google.addAccount') }}</p>
                <p class="ui-text-warning">{{ $t('security.google.rebindWarning') }}</p>
              </div>
              <div class="ewms">
                <div class="ewms-item">
                  <div class="ewms-box">
                    <FormEwm :url="qr_code" width="100%" :notShadow="true"></FormEwm>
                  </div>
                </div>
              </div>
              <div class="list-b-8">
                <div class="tip">{{ $t('security.google.manualCode') }}</div>
                <div class="secretKeyBox">
                  <p>{{ maskSecretKey(googleAuthKey) }}</p>
                  <Button
                    type="text"
                    class="copy-btn"
                    @click="copyAuthKey"
                    :disabled="!googleAuthKey"
                  >
                    <Icon type="md-copy" /> {{ $t('security.google.copy') }}
                  </Button>
                </div>
              </div>
            </div>
          </template>
          <template #step3>
            <div class="googleModalBox">
              <div class="tip">{{ $t('security.google.enterCodeTip') }}</div>
              <FormOtpInput
                ref="codeInputRef"
                v-model="pup.form.code"
                class="google-code-inputs"
                :aria-label="$t('security.google.codePlaceholder')"
                :disabled="loading"
              />
            </div>
          </template>
        </UiStep>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import {ref,reactive,nextTick,watch,onBeforeUnmount} from 'vue'
import FormOtpInput from '@/components/form/FormOtpInput/index.vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
import { copyText } from '@/utils/dataInfo.js'
  const props = defineProps({
})
const emits = defineEmits(['success'])
const steps=[
  {
    label: t('security.google.downloadStep')
  },
  {
    label: t('security.google.scanStep')
  },
  {
    label: t('security.google.verifyStep')
  }
]
const loading=ref(false)
const googleAuthKey=ref('')
const qr_code=ref('')
const codeInputRef=ref(null)
let requestGeneration=0
// 复制验证器密钥到剪贴板
const copyAuthKey = () => {
  copyText(googleAuthKey.value, t('security.google.keyCopied'))
}
//获取Google验证器
const getCode=()=>{
  if(googleAuthKey.value) return
  postApi('user/auth/createSecretKey')
    .then((res) => {
      googleAuthKey.value=res.secret_key
      qr_code.value=res.qr_code
    })
    .catch((err) => {
    })
}
// 用于处理密钥显示的函数，中间部分使用***遮盖
const maskSecretKey = (key) => {
  if (!key || key.length < 8) return key

  // 取前3位和后3位，中间部分用***替换
  const prefix = key.substring(0, 3)
  const suffix = key.substring(key.length - 3)
  return prefix + '******' + suffix
}
const nextStep=(current)=>{
  if(current===steps.length-1){
    nextTick(() => codeInputRef.value?.focus())
  }
}
const finish=()=>{
  if(loading.value) return
  const {code}=pup.form
  if(!code || code.length!==6 || !/^[0-9]{6}$/.test(code)){
    message(t('security.google.invalidCode'),'error')
    return
  }
  const generation=requestGeneration
  loading.value=true
  //验证谷歌验证码
  postApi('/user/auth/verifySecretKey',{
    code:code,
    secret: googleAuthKey.value,
  })
    .then((res) => {
      if(generation!==requestGeneration || !pup.status) return
      message(t('security.google.bindSuccess'))
      close()
      emits('success')
    })
    .catch((err) => {
      if(generation!==requestGeneration || !pup.status || err?.silent || err?.cancelled || err?.msg==='SILENT_ERROR') return
      codeInputRef.value?.clear()
    })
    .finally(() => {
      loading.value=false
      if(generation===requestGeneration && pup.status && !pup.form.code){
        codeInputRef.value?.focus()
      }
    })
}
const pup = reactive({
  status:false,
  title: t('security.google.title'),
  width:600,
  labelPosition:'top',
  isNotFooter:true,
  form:{
    code:'',
  },
})
watch(() => pup.status, () => {
  requestGeneration++
}, { flush: 'sync' })
onBeforeUnmount(() => {
  requestGeneration++
})
const open=()=>{
  pup.form.code=''
  pup.status=true
  getCode()
}
const close=()=>{
  pup.status=false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="less">
.googleModal{
  padding:var(--ui-padding-0-8);
  .googleModalBox{
    height:340px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap:18px;
    .tip{
      text-align: center;
    }
    .ewms{
      display: flex;
      gap:24px;
      .ewms-item{
        .ewms-box{
          width:var(--ui-size-160);
          height:var(--ui-size-160);
          background-color: #fff;
          padding: var(--ui-padding-8);
          border: var(--ui-border-subtle);
          img{
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
        p{
          margin-top: 6px;
          text-align: center;
        }
      }
    }
    .secretKeyBox{
      display: flex;
      align-items: center;
      justify-content: center;
      gap:8px;
      padding: var(--ui-padding-6-12);
      background-color: #f8f9fb;
      border:var(--ui-border-subtle);
      border-radius: var(--ui-radius-6);
      p{
        flex: 1%;
      }
    }
    :deep(.google-code-inputs){
      max-width: 352px;
    }
  }
}
</style>
