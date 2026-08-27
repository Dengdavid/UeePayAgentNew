<template>
    <div v-show="card.id" class="debit-card" :class="`card-level-${level}`">
        <div class="card-face card-front">
            <div class="card-info">
                <div class="logo">
                </div>
                <div class="card-details">
                    <div class="no text" :class="{ 'ui-pointer': !masked }" @click="handlePrivateCopy(card.card_no)">{{ displayCardNo }}</div>
                    <div class="security-info">
                        <div class="card-cvv">
                            <span class="card-cvv-value text" :class="{ 'ui-pointer': !masked }" @click="handlePrivateCopy(card.cvv)">{{ displayCvv }}</span>
                        </div>
                        <div class="valid-thru">
                            <div class="time text" :class="{ 'ui-pointer': !masked }" @click="handlePrivateCopy(card.expire_date)">{{ displayExpireDate }}</div>
                        </div>
                        <Tooltip :content="masked ? $t('card.index.detail.overview.showFullCardInfo') : $t('card.index.detail.overview.hideFullCardInfo')" placement="top" theme="light" transfer :disabled="isPhone">
                            <button
                                class="private-toggle"
                                type="button"
                                :disabled="privateLoading"
                                @click.stop="emit('toggle-private')"
                            >
                                <Icon :type="privateLoading ? 'ios-loading' : (masked ? 'md-eye-off' : 'md-eye')" :class="{ 'private-toggle-loading': privateLoading }" />
                            </button>
                        </Tooltip>
                    </div>
                    <div class="name text ui-pointer" @click="handleCopy(card.holder_username)">{{ card.holder_username || '' }}</div>
                </div>
                <div class="brand" :class="networkClass">
                    <BankTypeLogo :bin="card.card_bin" :type="card.bin?.network"></BankTypeLogo>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { Copy } from 'view-ui-plus'
import { useCardStoreRefs, useUserStoreRefs } from '@/utils/store.js'
import BankTypeLogo from '@/components/ui/bank-type-logo.vue'
import { isPhone } from '@/utils/device.js'
const props = defineProps({
    card: {
        type: Object,
        default: function() {
            return {}
        }
    },
    masked: {
        type: Boolean,
        default: true
    },
    privateLoading: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['toggle-private'])

const { userGroup } = useUserStoreRefs()
const { binMaps } = useCardStoreRefs()

const level = computed(() => {
    const id = Number(userGroup.value?.id)
    // 12为普卡，3和默认为黑金卡
    return id > 0 && id < 3 ? id : 3
})
const networkClass = computed(() => {
    const network = props.card.bin?.network || binMaps.value?.[props.card.card_bin]?.network
    return typeof network === 'string' ? network.toLowerCase() : ''
})
const displayCardNo = computed(() => {
    const cardNo = String(props.card.card_no || '').replace(/\s/g, '')
    if (!cardNo) return ''
    const displayValue = props.masked && cardNo.length > 10
        ? `${cardNo.slice(0, 6)}${'*'.repeat(cardNo.length - 10)}${cardNo.slice(-4)}`
        : props.masked
            ? cardNo.replace(/.(?=.{4})/g, '*')
            : cardNo
    return displayValue
})
const displayExpireDate = computed(() => props.card.expire_date ? (props.masked ? '**/**' : props.card.expire_date) : '')
const displayCvv = computed(() => props.card.cvv ? (props.masked ? '***' : props.card.cvv) : '')

const handlePrivateCopy = (value) => {
    if (props.masked) return
    handleCopy(value)
}

const handleCopy = (value) => {
    if (!value) return
    Copy({ text: String(value) })
}
</script>

<style scoped lang="less">
.debit-card {
  position: relative;
  width: var(--ui-size-397);
  height: var(--ui-size-249);

  .card-face {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
  }

  .card-front {
    color: var(--ui-color-text-inverse);
    text-shadow: 0 2px rgba(0, 0, 0, 0.2);
  }

  .card-info {
    position: relative;
    width: 100%;
    height: 100%;

    > * {
      position: absolute;
    }

    .logo {
      top: 23px;
      left: 27px;
      font-size: 18px;
      font-weight: normal;
      line-height: 1;
      letter-spacing: 0.03em;

      img {
        max-height: 22px;
        filter: brightness(0) invert(1);
        opacity: 0.72;
      }
    }

    .no {
      font-size: 24px;
      font-weight: normal;
      line-height: 30px;
      letter-spacing: 0.09em;
    }

    .name {
      margin-top: 13px;
      font-size: 20px;
      font-weight: normal;
      line-height: 1;
      letter-spacing: 0.08em;
    }

    .brand {
      right: 27px;
      bottom: 23px;
      width: var(--ui-size-58);
      height: var(--ui-size-42);
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: none;

      :deep(img) {
        display: block;
        width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .visa,
    .discover {
      filter: brightness(100);
    }
  }

  .card-details {
    top: 136px;
    left: 27px;
  }

  .security-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 8px;
    line-height: 20px;
    font-family: PhpSans, MiSans, -apple-system, "Segoe UI", sans-serif;

    :deep(.ivu-tooltip-rel) {
      display: inline-flex;
      align-items: center;
    }
  }

  .valid-thru .time {
    font-size: 20px;
    font-weight: normal;
    letter-spacing: 0.08em;
  }

  .card-cvv {
    display: flex;
    align-items: center;
    line-height: 20px;

    &-value {
      font-size: 20px;
      letter-spacing: 0.08em;
    }
  }

  .private-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-size-24);
    height: var(--ui-size-20);
    padding: 0;
    border: 0;
    color: var(--ui-color-text-inverse);
    font-size: 14px;
    line-height: 1;
    background: transparent;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      opacity: 0.78;
      outline: none;
    }

    &:disabled {
      cursor: wait;
      opacity: 0.65;
    }
  }

  .private-toggle-loading {
    animation: private-toggle-spin var(--ui-card-private-loading-duration) var(--ui-ease-linear) infinite;
  }

  &.card-level-1 .card-front {
    background-image: url('@/assets/images/card_vip_f_1.png');
  }

  &.card-level-2 .card-front {
    background-image: url('@/assets/images/card_vip_f_2.png');
  }

  &.card-level-3 .card-front {
    background-image: url('@/assets/images/card_vip_f_3.png');
  }
}

@media screen and (max-width: 768px) {
  .debit-card {
    .card-details {
      top: 126px;
      left: 24px;
    }

    .card-info {
      .no {
        font-size: 22px;
        line-height: 28px;
      }

      .name {
        margin-top: 10px;
        font-size: 18px;
        line-height: 22px;
      }
    }

    .security-info {
      gap: 16px;
      margin-top: 6px;
    }

    .valid-thru .time,
    .card-cvv-value {
      font-size: 18px;
    }
  }
}

@keyframes private-toggle-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
