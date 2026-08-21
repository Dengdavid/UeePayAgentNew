<template>
   <PageLogin :title="$t('register.title')">
    <Form ref="formRef" :model="form" :rules="rules" label-position="top">
      <FormItem prop="nickname" >
        <FormInput v-model="form.nickname" size="large" :placeholder="$t('register.placeholder.account')" maxlength="20">
           <template #prefix>
            <Icon type="md-person" />
          </template>
        </FormInput>
      </FormItem>
      <FormItem prop="email" >
        <FormEmail size="large" :data="form" dataName="email" :placeholder="$t('register.placeholder.email')">
          <template #prefix>
            <Icon type="md-mail" />
          </template>
        </FormEmail>
      </FormItem>
      <FormItem prop="email_code" >
        <FormCode size="large" event="register" :placeholder="$t('register.placeholder.verificationCode')" v-model="form.email_code" :email="form.email">
          <template #prefix>
            <Icon type="md-checkmark-circle" />
          </template>
        </FormCode>
      </FormItem>
      <FormItem prop="pwd">
        <FormInput v-model="form.pwd" size="large" type="password" :placeholder="$t('register.placeholder.password')" maxlength="30">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </FormInput>
      </FormItem>
      <FormItem prop="repwd">
        <FormInput v-model="form.repwd" size="large" type="password" :placeholder="$t('register.placeholder.confirmPassword')" maxlength="30">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </FormInput>
      </FormItem>
      <FormItem prop="invite_code">
        <FormInput v-model="form.invite_code" size="large" :disabled="inviteCodeDisabled" :placeholder="$t('register.placeholder.invitationCode')">
          <template #prefix>
            <Icon type="md-mail-open" />
          </template>
        </FormInput>
      </FormItem>
      <div class="list-b-16">
        <div class="agreement-section">
            <Checkbox v-model="agreedToTerms" class="agreement-checkbox">{{ $t('register.agreement.agreePrefix') }}</Checkbox>
            <a class="agreement-link" @click.stop="userAgreementPup.status = true">{{ $t('register.agreement.userAgreement') }}</a>
            <span>{{ $t('register.agreement.conjunction') }}</span>
            <a class="agreement-link" @click.stop="privacyPup.status = true">{{ $t('register.agreement.privacyPolicy') }}</a>
        </div>
        <Button type="primary" size="large" :loading="buttonLoading" :disabled="!agreedToTerms" long @click="handleRegister">{{ $t('register.action.registerNow') }}</Button>
        <div class="footer">
          <div class="left">
            <span>{{ $t('register.prompt.hasAccount') }}</span>
            <a @click="toRoute('login')">{{ $t('register.action.loginNow') }}</a>
          </div>
          <div class="right">
            <a @click="toRoute('forgot-password')">{{ $t('register.action.forgotPassword') }}</a>
          </div>
        </div>
      </div>
     </Form>
      <!-- 用户协议弹窗 -->
      <FormPupBox
        :pup="userAgreementPup"
        :mask-closable="false"
        class="agreement-modal"
        @scroll-bottom="userAgreementReachedBottom = true"
      >
        <UserAgreementModal
          @read-complete="userAgreementReachedBottom = true"
        />
      </FormPupBox>

      <!-- 隐私协议弹窗 -->
      <FormPupBox
        :pup="privacyPup"
        :mask-closable="false"
        class="agreement-modal"
        @scroll-bottom="privacyReachedBottom = true"
      >
        <PrivacyModal
          @read-complete="privacyReachedBottom = true"
        />
      </FormPupBox>
   </PageLogin>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import { goBack,toRoute } from '@/utils/route.js'
import { useRoute } from 'vue-router'
const route = useRoute()
import PageLogin from '@/views/components/PageLogin/index.vue'
import { useUserStore } from '@/store/user.js'
import { useAppStore } from '@/store/app.js'
import PrivacyModal from './PrivacyModal.vue'
import UserAgreementModal from './UserAgreementModal.vue'
const userStore = useUserStore();
const appStore = useAppStore();
const buttonLoading=ref(false)
const agreedToTerms=ref(false)
const userAgreementReachedBottom = ref(false)
const privacyReachedBottom = ref(false)
const userAgreementConfirmed = ref(false)
const privacyConfirmed = ref(false)
const allAgreementsConfirmed = computed(() => userAgreementConfirmed.value && privacyConfirmed.value)

const createAgreementPup = (title, reachedBottom, confirmRead) => reactive({
  status: false,
  title,
  width: 1100,
  maxHeight:900,
  form: {},
  actions: [
    {
      get label() {
        return reachedBottom.value ? t('register.agreement.read') : t('register.agreement.readAll')
      },
      disabled: () => !reachedBottom.value,
      click: (pup) => {
        confirmRead()
        pup.status = false
      },
    },
  ],
})
const confirmAgreement = (confirmed) => {
  confirmed.value = true
  if (allAgreementsConfirmed.value) {
    agreedToTerms.value = true
  }
}
const userAgreementPup = createAgreementPup(
  t('register.agreement.userAgreementTitle'),
  userAgreementReachedBottom,
  () => confirmAgreement(userAgreementConfirmed),
)
const privacyPup = createAgreementPup(
  t('register.agreement.privacyPolicyTitle'),
  privacyReachedBottom,
  () => confirmAgreement(privacyConfirmed),
)
const formRef=ref(null)
const form=ref({
  nickname: '',
  email: '',
  email_code: '',
  pwd: '',
  repwd: '',
  invite_code: ''
})
const rules = {
  nickname: [
      { required: true, message: t('register.validation.accountRequired'), trigger: 'blur' },
      { min: 6, max: 20, message: t('register.validation.accountLength'), trigger: 'blur' },
      {
          validator: (rule, value, callback) => {
              if (value.trim() !== value) {
                  callback(new Error(t('register.validation.accountTrim')));
              } else if (value.includes(' ')) {
                  callback(new Error(t('register.validation.accountSpaces')));
              } else {
                  // 判断是否为邮箱格式
                  const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                  if (emailRegex.test(value)) {
                      // 如果是邮箱格式，允许特殊字符
                      callback();
                  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
                      // 如果不是邮箱格式，则仅允许中文、英文字母和数字
                      callback(new Error(t('register.validation.accountFormat')));
                  } else {
                      callback();
                  }
              }
          }, trigger: 'blur'
      }
  ],
  email: [
      { required: true, message: t('register.validation.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('register.validation.emailFormat'), trigger: ['change', 'blur'] }
  ],
  email_code: [
      { required: true, message: t('register.validation.verificationCodeRequired'), trigger: 'blur' }
  ],
  pwd: [
      { required: true, message: t('register.validation.passwordRequired'), trigger: 'blur' },
      { min: 6, max: 30, message: t('register.validation.passwordLength'), trigger: 'blur' }
  ],
  repwd: [
      { required: true, message: t('register.validation.confirmPasswordRequired'), trigger: 'blur' },
      {
          validator: (rule, value, callback) => {
              if (value === '') {
                  callback(new Error(t('register.validation.confirmPasswordRequired')));
              } else if (value !== form.value.pwd) {
                  callback(new Error(t('register.validation.passwordMismatch')));
              } else {
                  callback();
              }
          }, trigger: 'blur'
      }
  ]
}
//登录
const handleRegister=()=>{
  if (!agreedToTerms.value) {
    message(t('register.agreement.required'), 'warning')
    return
  }
  formRef.value.validate((valid) => {
    if(valid) {
      buttonLoading.value = true;
      postApi('/user/auth/register',form.value).then(async (res) => {
        message(t('register.message.success'))
        await userStore.login(res.token);
        appStore.init();
        // 注册成功后清除邀请码缓存
        localStorage.removeItem('invite_code');
        goBack()
      })
      .catch((err) => {
        message(err?.msg || err || t('register.message.failed'),'error')
      }).finally(() => {
        buttonLoading.value = false;
      })
    }
  })
}
const inviteCodeDisabled=ref(false)
// 处理邀请码逻辑
const handleInviteCode = () => {
    // 先检查localStorage中是否有缓存的邀请码
    const cachedInviteCode = localStorage.getItem('invite_code')
    const queryCode = route.query.invite_code || route.query.code
    inviteCodeDisabled.value = true
    if (queryCode) {
        // URL有邀请码，使用URL中的邀请码
        form.value.invite_code = queryCode
        // 并缓存到localStorage
        localStorage.setItem('invite_code', queryCode)
        return
    } else if(cachedInviteCode) {
        // 已有缓存的邀请码，优先使用缓存值，忽略URL参数
        form.value.invite_code = cachedInviteCode
        return
    }
    inviteCodeDisabled.value = false
}
// 点击其他区域关闭下拉菜单
onMounted(() => {
  handleInviteCode()
})
</script>

<style scoped lang="less">
.footer{
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-space-12);
  .left,
  .right{
    display: flex;
    align-items: center;
    gap: var(--ui-space-4);
    white-space: nowrap;
  }
}
.agreement-section{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  >*{
    flex-shrink: 0;
    margin: 0 !important;
    white-space: nowrap;
    &:not(:last-child){
      margin-right: 6px !important;
    }
  }
}
.notice{
  margin-top: 25px;
  padding:var(--ui-padding-16);
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: var(--ui-radius-6);
  border: var(--ui-border-primary-subtle);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.08);
  position: relative;
  overflow: hidden;
  .title{
    font-size: 14px;
  }
  ul{
    list-style: none;
    li{
      color: var(--ui-color-text-subtle);
    transition: all 0.2s ease;
      &:hover{
        color: var(--ui-color-neutral-900);
        transform: translateX(2px);
      }
    }
  }
}
</style>
<style lang="less">
.agreement-modal .ivu-modal-body {
  overflow: hidden;
}
@media screen and (max-width: 768px) {
  .ivu-modal{
    top:4px;
  }
}
</style>
