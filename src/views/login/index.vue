<template>
   <PageLogin :title="$t('login.title')" bgKey="login_background">
    <Form ref="formRef" :model="form" :rules="rules" label-position="top" autocomplete="on" @keyup.enter="handleLogin">
      <FormItem prop="nickname" >
        <FormInput v-model="form.nickname" name="username" autocomplete="username" size="large" :placeholder="$t('login.placeholder.account')" >
           <template #prefix>
            <Icon type="md-person" />
          </template>
        </FormInput>
      </FormItem>
      <FormItem prop="pwd">
        <FormInput v-model="form.pwd" name="password" autocomplete="current-password" size="large" type="password" :placeholder="$t('login.placeholder.password')">
          <template #prefix>
            <Icon type="md-lock" />
          </template>
        </FormInput>
      </FormItem>
      <div class="list-b-16">
        <Button type="primary" size="large" :loading="buttonLoading" long @click="handleLogin">{{ $t('login.action.loginNow') }}</Button>
        <div class="footer">
          <div class="left">
            <span>{{ $t('login.prompt.noAccount') }}</span>
            <a @click="toRoute('register')">{{ $t('login.action.registerNow') }}</a>
          </div>
          <div class="right">
            <a @click="toRoute('forgot-password')">{{ $t('login.action.forgotPassword') }}</a>
          </div>
        </div>
      </div>
    </Form>
   </PageLogin>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { postApi } from '@/utils/api.js'
import { t } from '@/utils/index.js'
import { message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import PageLogin from '@/views/components/PageLogin/index.vue'
import { useUserStore } from '@/store/user.js'
import { useAppStore } from '@/store/app.js'
const userStore = useUserStore();
const appStore = useAppStore();
const buttonLoading=ref(false)
const formRef=ref(null)
const form=ref({
  nickname: '',
  pwd: '',
})
const rules = {
  nickname: [
      {required: true, message: t('login.validation.accountRequired'), trigger: 'blur'}
  ],
  pwd: [
      {required: true, message: t('login.validation.passwordRequired'), trigger: 'blur'}
  ]
}
const notices = computed(() => [
  t('login.notice.sufficientBalance'),
  t('login.notice.noMaliciousBinding'),
  t('login.notice.noAuthorizationOnlyBinding'),
  t('login.notice.noFraudulentTransactions'),
  t('login.notice.accountHolderOnly'),
])
//登录
const handleLogin=()=>{
  formRef.value.validate((valid) => {
    if(valid) {
      buttonLoading.value = true;
      postApi('/user/auth/login',form.value).then(async (res) => {
        message(t('login.message.success'))
        await userStore.login(res.token);
        appStore.init();
        await toRoute('home', {}, 'query', { replace: true })
      })
      .catch((err) => {
        message(err?.msg || err || t('login.message.failed'),'error')
      }).finally(() => {
        buttonLoading.value = false;
      })
    }
  })
}
// 点击其他区域关闭下拉菜单
onMounted(() => {
    // 可以保留基本初始化逻辑
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
