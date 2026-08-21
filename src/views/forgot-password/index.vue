<template>
   <PageLogin :title="$t('forgotPassword.title')">
    <Form ref="formRef" :model="form" :rules="rules" label-position="top"  @keyup.enter="handleResetPassword">
      <FormItem prop="email" >
        <FormEmail size="large" :data="form" dataName="email" :placeholder="$t('forgotPassword.placeholder.email')" @on-change="form.code=''">
          <template #prefix>
            <Icon type="md-mail" />
          </template>
        </FormEmail>
      </FormItem>
      <FormItem prop="code">
        <FormCode v-model="form.code" :email="form.email" size="large" :placeholder="$t('forgotPassword.placeholder.verificationCode')" >
          <template #prefix>
            <Icon type="md-checkmark-circle" />
          </template>
        </FormCode>
      </FormItem>
      <FormItem prop="pwd">
        <FormInput v-model="form.pwd" size="large" type="password" :placeholder="$t('forgotPassword.placeholder.password')">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </FormInput>
      </FormItem>
      <FormItem prop="repwd">
        <FormInput v-model="form.repwd" size="large" type="password" :placeholder="$t('forgotPassword.placeholder.confirmPassword')">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </FormInput>
      </FormItem>
      <div class="list-b-16">
        <Button type="primary" size="large" :loading="buttonLoading" long @click="handleResetPassword">{{ $t('forgotPassword.action.resetPassword') }}</Button>
        <div class="footer">
          <div class="left">
            <span>{{ $t('forgotPassword.prompt.hasAccount') }}</span>
            <a @click="toRoute('login')">{{ $t('forgotPassword.action.loginNow') }}</a>
          </div>
          <div class="right">
            <span>{{ $t('forgotPassword.prompt.noAccount') }}</span>
            <a @click="toRoute('register')">{{ $t('forgotPassword.action.registerNow') }}</a>
          </div>
        </div>
      </div>
    </Form>
   </PageLogin>
</template>

<script setup>
import { ref, onMounted,nextTick,watch } from 'vue'
import { postApi } from '@/utils/api.js'
import { t } from '@/utils/index.js'
import { message } from '@/utils/message.js'
import { goBack,toRoute } from '@/utils/route.js'
import { useRoute } from 'vue-router'
const route = useRoute()
import PageLogin from '@/views/components/PageLogin/index.vue'
import { useUserStore } from '@/store/user.js'
import { useAppStore } from '@/store/app.js'
import { Button } from 'view-ui-plus'
const userStore = useUserStore();
const appStore = useAppStore();
const buttonLoading=ref(false)
const formRef=ref(null)
const form=ref({
  email: '',
  code: '',
  pwd: '',
  repwd: ''
})
const rules = {
  email: [
      { required: true, message: t('forgotPassword.validation.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('forgotPassword.validation.emailFormat'), trigger: ['change', 'blur'] }
  ],
  code: [
      { required: true, message: t('forgotPassword.validation.verificationCodeRequired'), trigger: 'blur' },
      { min: 6, max: 6, message: t('forgotPassword.validation.verificationCodeLength'), trigger: 'blur' }
  ],
  pwd: [
      { required: true, message: t('forgotPassword.validation.passwordRequired'), trigger: 'blur' },
      { min: 6, message: t('forgotPassword.validation.passwordLength'), trigger: 'blur' }
  ],
  repwd: [
      { required: true, message: t('forgotPassword.validation.confirmPasswordRequired'), trigger: 'blur' },
      {
          validator: (rule, value, callback) => {
              if (value !== form.value.pwd) {
                  return callback(new Error(t('forgotPassword.validation.passwordMismatch')));
              }
              callback();
          },
          trigger: 'blur'
      }
  ]
}
//登录
const handleResetPassword=()=>{
  formRef.value.validate((valid) => {
    if(valid) {
      buttonLoading.value = true;
      postApi('/user/auth/forgotPwd',form.value).then((res) => {
        message(t('forgotPassword.message.success'))
        toRoute('login')
      })
      .catch((err) => {
        message(err?.msg || err || t('forgotPassword.message.failed'),'error')
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
  >*{
    margin: 0 !important;
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
.ivu-modal-body {
  max-height:80vh;
  overflow-y: auto;
}
</style>
