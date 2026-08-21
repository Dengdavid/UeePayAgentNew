<template>
  <div class="auth-status-container">
    <div class="auth-title">
      <img src="@/assets/images/idcard.png" alt="ID Card" class="id-card-icon" />
      <span>
        {{ $t('card.index.opening.identityVerification') }} (<span :class="statusInfo.statusClass">{{ statusInfo.statusText }}</span>)
      </span>
    </div>

    <div class="status-action-container">
      <a :class="['view-detail', statusInfo.actionClass]" @click="emit('action')">
        <span class="underline">{{ statusInfo.actionText }}</span>
        <Icon type="ios-arrow-forward" />
      </a>
    </div>

    <div class="auth-desc">
      {{ $t('card.index.opening.identityRequirement') }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils'

const props = defineProps({
  status: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['action'])

const statusInfo = computed(() => {
  if (props.status === 1) {
    return {
      statusText: t('card.index.opening.verificationStatus.approved'),
      statusClass: 'status-success',
      actionText: t('card.index.opening.verificationAction.viewDetails'),
      actionClass: '',
    }
  }
  if (props.status === 0) {
    return {
      statusText: t('card.index.opening.verificationStatus.pending'),
      statusClass: 'status-pending',
      actionText: t('card.index.opening.verificationAction.viewProgress'),
      actionClass: 'supplement',
    }
  }
  if (props.status === -1) {
    return {
      statusText: t('card.index.opening.verificationStatus.rejected'),
      statusClass: 'status-failed',
      actionText: t('card.index.opening.verificationAction.verifyAgain'),
      actionClass: 'resubmit',
    }
  }
  return {
    statusText: t('card.index.opening.verificationStatus.unverified'),
    statusClass: 'status-failed',
    actionText: t('card.index.opening.verificationAction.verifyNow'),
    actionClass: 'verify',
  }
})
</script>

<style scoped lang="less">
.auth-status-container {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  border: var(--ui-border-muted);
  border-radius: var(--ui-radius-lg);
  background: #fafcff;
}

.auth-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  color: var(--ui-color-text);
  font-size: 13px;
  font-weight: 500;
}

.id-card-icon {
  width: var(--ui-size-18);
  height: var(--ui-size-18);
  object-fit: contain;
}

.auth-desc {
  padding-right: 80px;
  color: var(--ui-color-text-muted);
  font-size: 12px;
  line-height: 18px;
}

.status-action-container {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
}

.status-success {
  color: var(--ui-color-success);
}

.status-pending {
  color: var(--ui-color-notice);
}

.status-failed,
.view-detail.resubmit {
  color: #ff4d4f;
}

.view-detail {
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &.supplement {
    color: var(--ui-color-notice);
  }

  &.verify {
    color: var(--ui-color-info);
  }
}

</style>
