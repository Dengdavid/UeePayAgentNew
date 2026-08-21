<template>
  <section class="card-failure-tips" aria-labelledby="failure-tips-title">
    <header class="tip-header">
      <div>
        <h4 id="failure-tips-title">{{ $t('card.index.opening.failureTips.title') }}</h4>
        <p>{{ $t('card.index.opening.failureTips.subtitle') }}</p>
      </div>
    </header>

    <div class="reason-list">
      <div class="reason-head" aria-hidden="true">
        <span></span>
        <span>{{ $t('card.index.opening.failureTips.issue') }}</span>
        <span>{{ $t('card.index.opening.failureTips.possibleCause') }}</span>
        <span>{{ $t('card.index.opening.failureTips.recommendation') }}</span>
      </div>
      <div class="reason-item">
        <span class="reason-index">01</span>
        <div class="reason-content">
          <strong>{{ $t('card.index.opening.failureTips.insufficientBalance') }}</strong>
          <p class="reason-cause"><span class="mobile-field-label">{{ $t('card.index.opening.failureTips.possibleCause') }}</span><span>{{ $t('card.index.opening.failureTips.insufficientBalanceCause') }}</span></p>
          <p class="reason-advice"><span class="advice-label">{{ $t('card.index.opening.failureTips.recommendation') }}</span><span class="advice-text">{{ $t('card.index.opening.failureTips.insufficientBalanceAdvice') }}</span></p>
        </div>
      </div>
      <div class="reason-item">
        <span class="reason-index">02</span>
        <div class="reason-content">
          <strong>{{ $t('card.index.opening.failureTips.merchantRestricted') }}</strong>
          <p class="reason-cause"><span class="mobile-field-label">{{ $t('card.index.opening.failureTips.possibleCause') }}</span><span>{{ $t('card.index.opening.failureTips.merchantRestrictedCause') }}</span></p>
          <p class="reason-advice"><span class="advice-label">{{ $t('card.index.opening.failureTips.recommendation') }}</span><span class="advice-text">{{ $t('card.index.opening.failureTips.merchantRestrictedAdvice') }}</span></p>
        </div>
      </div>
      <div class="reason-item">
        <span class="reason-index">03</span>
        <div class="reason-content">
          <strong>{{ $t('card.index.opening.failureTips.networkIssue') }}</strong>
          <p class="reason-cause"><span class="mobile-field-label">{{ $t('card.index.opening.failureTips.possibleCause') }}</span><span>{{ $t('card.index.opening.failureTips.networkIssueCause') }}</span></p>
          <p class="reason-advice"><span class="advice-label">{{ $t('card.index.opening.failureTips.recommendation') }}</span><span class="advice-text">{{ $t('card.index.opening.failureTips.networkIssueAdvice') }}</span></p>
        </div>
      </div>
      <div class="reason-item">
        <span class="reason-index">04</span>
        <div class="reason-content">
          <strong>{{ $t('card.index.opening.failureTips.browserIssue') }}</strong>
          <p class="reason-cause"><span class="mobile-field-label">{{ $t('card.index.opening.failureTips.possibleCause') }}</span><span>{{ $t('card.index.opening.failureTips.browserIssueCause') }}</span></p>
          <p class="reason-advice"><span class="advice-label">{{ $t('card.index.opening.failureTips.recommendation') }}</span><span class="advice-text">{{ $t('card.index.opening.failureTips.browserIssueAdvice') }}</span></p>
        </div>
      </div>
    </div>
    <UiNotice type="plain" class="risk-notice" showIcon>
      {{ $t('card.index.opening.failureTips.retryNotice') }}
    </UiNotice>
  </section>
</template>

<style scoped lang="less">
.card-failure-tips {
  margin-top: 24px;
  padding: 18px 20px 16px;
  overflow: hidden;
  border: var(--ui-border-muted);
  border-radius: var(--ui-radius-lg);
  background: linear-gradient(180deg, #fafcff 0, #fff 20%, #fff 100%);
  color: var(--ui-color-text);
}

.tip-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 13px;

  h4 {
    margin-bottom: 3px;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
  }

  p {
    color: var(--ui-color-text-muted);
    font-size: 12px;
    line-height: 18px;
  }
}

.reason-list {
  display: grid;
  grid-template-columns: 1fr;
  padding: 0 0 5px;
}

.reason-head {
  display: grid;
  grid-template-columns: 16px 120px minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  margin: 0;
  padding: var(--ui-padding-6-8);
  border-radius: var(--ui-radius-sm);
  background: linear-gradient(90deg, #f1f5ff 0%, #f7f9fc 100%);
  color: var(--ui-color-neutral-700);
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
}

.reason-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
  padding: 13px 8px;

  & + & {
    border-top: 1px solid #edf0f4;
  }

  .reason-content > p {
    color: var(--ui-color-control-text);
    font-size: 12px;
    line-height: 20px;
    word-break: break-word;
  }

  .reason-content > strong {
    display: block;
    color: var(--ui-color-text);
    font-size: 13px;
    font-weight: 500;
  }
}

.reason-content {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: flex-start;
  min-width: 0;
}

.reason-advice {
  display: flex;
  align-items: flex-start;
  min-height: 20px;
  margin-top: 0;
  color: var(--ui-color-control-text) !important;

  .advice-label {
    display: none;
    flex: 0 0 auto;
    margin-top: 1px;
    margin-right: 6px;
    padding: var(--ui-padding-0-6);
    border-radius: var(--ui-radius-3);
    background: #eaf8f0;
    color: #168a50;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
  }
}

.mobile-field-label {
  display: none;
}

.advice-text {
  min-width: 0;
}

.reason-index {
  flex: 0 0 22px;
  color: #a6afbd;
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 20px;
}

.risk-notice {
  margin-top: 2px;
}

@media screen and (max-width: 768px) {
  .card-failure-tips {
    margin-top: 20px;
    padding: var(--ui-padding-14);
  }

  .tip-header {
    padding-bottom: 11px;

    h4 {
      font-size: 15px;
    }
  }

  .reason-list {
    grid-template-columns: 1fr;
  }

  .reason-head {
    display: none;
  }

  .reason-item {
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 10px;
    padding: var(--ui-padding-12-0);

    & + & {
      border-top: 1px solid #edf0f4;
    }
  }

  .reason-content {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .reason-cause,
  .reason-advice {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 6px;
    align-items: flex-start;
  }

  .mobile-field-label {
    display: block;
    width: fit-content;
    margin-top: 1px;
    padding: var(--ui-padding-0-6);
    border-radius: var(--ui-radius-3);
    background: var(--ui-color-status-error-surface);
    color: #d94b2b;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
  }

  .reason-advice {
    margin-top: 0;

    .advice-label {
      display: block;
      width: fit-content;
      margin: 1px 0 0;
    }
  }
}
</style>
