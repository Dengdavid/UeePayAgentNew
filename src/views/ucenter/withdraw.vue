<template>
  <UiPage ref="pageRef" isBack>
    <div class="withdraw-layout">
      <div class="withdraw-wrap">
        <p class="mt-20">
          {{ $t('withdrawal.description') }}
        </p>
        <div class="ui-alert-bar mt-20 mb-20">
          <div class="content">
            <span>{{ $t('withdrawal.availableBalance') }}</span>
            <span class="ui-text-money">$ {{ user.money }}</span>
          </div>
        </div>

        <div class="mb-20 pt-10 pb-10">
          <p class="mb-10">{{ $t('withdrawal.amount') }}</p>
          <div class="ui-flex ui-flex-align-center">
            <InputNumber
              v-model="form.amount"
              class="ui-flex-full"
              :max="max"
              :min="min"
              :precision="3"
              :active-change="false"
              :placeholder="$t('withdrawal.amountPlaceholder')"
            />
            <a class="ui-flex-shrink ml-20" @click="handleAll">{{ $t('withdrawal.withdrawAll') }}</a>
          </div>
          <div class="mt-10 ui-text-grey">
            <span>{{ $t('withdrawal.fee') }}</span>
            <span class="ui-text-red"
              >$ {{ user.account_withdraw_fee || '0.000' }}
            </span>
            <router-link :to="{ name: 'pricing' }" class="ml-10"
              >{{ $t('withdrawal.lowerFee') }}</router-link
            >
          </div>
          <div class="mt-5 ui-text-grey">
            <span>{{ $t('withdrawal.actualAmount') }}</span>
            <span class="ui-text-red">$ {{ actualReceipt.toFixed(3) }}</span>
          </div>
        </div>

        <div class="mb-20 pb-10">
          <p class="mb-10">{{ $t('withdrawal.walletAddress') }}</p>
          <Input
            v-model="form.address"
            :placeholder="$t('withdrawal.walletPlaceholder')"
          />
          <p class="mt-5 ui-text-red">{{ $t('withdrawal.walletHint') }}</p>
        </div>

        <div class="mb-20 pb-10">
          <p class="mb-10">{{ $t('withdrawal.remark') }}</p>
          <Input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            :placeholder="$t('withdrawal.optional')"
          />
        </div>

        <Button type="primary" :loading="submiting" long @click="handleSubmit"
          >{{ $t('withdrawal.confirm') }}</Button
        >

        <div
          class="mt-20 mb-20 pt-10 pb-10 ui-flex ui-flex-align-center"
          style="justify-content: center"
        >
          <router-link
            :to="{ name: 'ucenter_finance', query: { type: 'withdraw' } }"
            >{{ $t('withdrawal.history') }}</router-link
          >
          <div
            style="
              margin: 0 20px;
              width: 1px;
              height: 12px;
              background-color: #d8d8d8;
            "
          ></div>
          <a :href="customerUrl" target="_blank">{{ $t('withdrawal.customerService') }}</a>
        </div>

        <div style="color: #9e9e9e; line-height: 24px">
          <p>{{ $t('withdrawal.noticeAddress') }}</p>
          <p>{{ $t('withdrawal.noticeTime') }}</p>
          <p>{{ $t('withdrawal.noticeSupport') }}</p>
        </div>
      </div>
    </div>
  </UiPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import calculator from '@/libs/calculator.js'
import { t } from '@/utils'

const router = useRouter()

import { storeToRefs } from 'pinia'
//
import { useAppStore } from '@/store/app.js'
const appStore = useAppStore()
const { customerUrl } = storeToRefs(appStore)
//
import { useUserStore } from '@/store/user.js'
const userStore = useUserStore()
const { user, userGroup } = storeToRefs(userStore)

const submiting = ref(false)
const form = ref({
  amount: null,
  address: '',
  remark: '',
})

const min = computed(() => {
  if (
    !userGroup.value.withdraw_min_amount ||
    userGroup.value.withdraw_min_amount == 0
  )
    return 1
  return Number(userGroup.value.withdraw_min_amount)
})

const max = computed(() => {
  if (!user.value.money) return 0
  if (!userGroup.value.withdraw_max_amount > user.value.money)
    return userGroup.value.withdraw_max_amount
  return Number(user.value.money) || 0
})

const actualReceipt = computed(() => {
  if (!form.value.amount) return 0
  const upper = calculator.reduce(
    user.value.money,
    user.value.account_withdraw_fee
  )
  if (form.value.amount <= upper) {
    return form.value.amount
  }
  return calculator.reduce(form.value.amount, user.value.account_withdraw_fee)
})

const handleAll = function () {
  form.value.amount = max.value
}

const handleBack = function () {
  router.back()
}

// 简化提现提交流程，移除手动验证
const handleSubmit = function () {
  if (submiting.value) return false

  // 表单验证
  if (!form.value.amount) {
    message(t('withdrawal.enterAmount'), 'error')
    return false
  }
  if (form.value.amount < min.value) {
    message(t('withdrawal.minimumAmount', { amount: min.value }), 'error')
    return false
  }
  if (form.value.amount > max.value) {
    message(t('withdrawal.maximumAmount', { amount: max.value }), 'error')
    return false
  }
  if (!form.value.address) {
    message(t('withdrawal.enterAddress'), 'error')
    return false
  }

  // 检查邮箱是否已激活
  if (user.value.email_status !== 1 && user.value.google_auth_status !== 1) {
    message(t('withdrawal.securityRequired'), 'error')
    return false
  }

  // 直接调用提现接口
  submiting.value = true
  userApi
    .withdraw(form.value)
    .then(() => {
      submiting.value = false
      message(t('withdrawal.submitted'))
      userStore.getUserInfo()
      router.push({name:'ucenter_finance',query:{type:'withdraw'}})
    })
    .catch((err) => {
      submiting.value = false
      message(err.msg || t('withdrawal.failed'), 'error')
    })
}

onMounted(() => {
  userStore.getUserInfo()
})
</script>

<style scoped>
.withdraw-layout {
  position: relative;
  text-align: center;
  background-color: #fff;
}
.breadcrumb-bar {
  padding: var(--ui-padding-15-20);
  border-bottom: 1px solid #fcfcfc;
}
.withdraw-wrap {
  margin: 0 auto;
  padding:var(--ui-padding-0-16);
  width: 100%;
  max-width: 440px;
  text-align: left;
}
.qrcode-box {
  position: relative;
  margin: var(--ui-margin-40-auto);
  width: 250px;
  height: 250px;
}
.qrcode-box img {
  width: 100%;
  height: 100%;
}
</style>
