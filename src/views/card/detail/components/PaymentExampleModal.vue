<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <div class="payment-example">
      <p class="payment-example-intro">
        {{ $t('card.index.detail.paymentExample.intro') }}
      </p>
      <div class="payment-example-image">
        <img src="@/assets/images/pay_example.png" :alt="$t('card.index.detail.paymentExample.imageAlt')" />
      </div>
      <section class="payment-example-tips">
        <h4>
          <Icon type="md-information-circle" aria-hidden="true" />
          <span>{{ $t('card.index.detail.paymentExample.reminder') }}</span>
        </h4>
        <ol>
          <li>{{ $t('card.index.detail.paymentExample.expiryTip') }}</li>
          <li>{{ $t('card.index.detail.paymentExample.nameTip') }}</li>
          <li>{{ $t('card.index.detail.paymentExample.addressTip') }}</li>
        </ol>
      </section>
    </div>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { t } from '@/utils'

const pupRef = ref(null)
const pup = reactive({
  status: false,
  title: t('card.index.detail.paymentExample.title'),
  width: 680,
  maxHeight: 'calc(100vh - 160px)',
  form: {},
  actions: [],
})

const open = () => {
  pup.status = true
}

const close = () => {
  pup.status = false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="less">
.payment-example {
  color: var(--ui-color-text);

  &-intro {
    margin-bottom: 14px;
    color: var(--ui-color-neutral-700);
    line-height: 22px;
  }

  &-image {
    overflow: hidden;
    background: #f7f8fa;
    border-radius: var(--ui-radius-6);

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  &-tips {
    margin-top: 16px;
    padding: var(--ui-padding-14-16);
    background: #f8fafc;
    border-radius: var(--ui-radius-6);

    h4 {
      display: flex;
      margin-bottom: 8px;
      align-items: center;
      gap: 6px;
      color: var(--ui-color-text);
      font-size: 14px;
      line-height: 22px;

      .ivu-icon {
        color: var(--primary-color);
        font-size: 17px;
      }
    }

    ol {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--ui-color-neutral-700);
      line-height: 22px;
    }

    li {
      min-height: 22px;
      padding: 0;
      text-align: left;
    }
  }
}

@media (max-width: 768px) {
  .payment-example {
    &-intro {
      margin-bottom: 10px;
    }

    &-tips {
      margin-top: 12px;
      padding: var(--ui-padding-12);
    }
  }
}
</style>
