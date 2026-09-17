<template>
  <Tooltip
    v-if="notice"
    placement="bottom"
    :content="$t('header.notice.title')"
    :disabled="disabled"
  >
    <button
      type="button"
      class="notice-trigger"
      :aria-label="$t('header.notice.title')"
      @click.stop="openNotice"
    >
      <Icon custom="iconfont icon-gonggao1" :size="16" />
    </button>
  </Tooltip>
</template>

<script setup>
import { computed, nextTick, watch } from 'vue'
import { Modal } from 'view-ui-plus'
import { t } from '@/utils'
import { useAppStoreRefs } from '@/utils/store.js'

const NOTICE_CONFIRMED_KEY = 'notice_confirmed'
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})
const { configDatas } = useAppStoreRefs()
const notice = computed(() => configDatas.value?.notice || '')

const getNoticeHash = (text) => text
  .split('')
  .reduce((total, character) => total + character.charCodeAt(0), 0)
  .toString()

const markNoticeConfirmed = () => {
  if (!notice.value) return
  localStorage.setItem(NOTICE_CONFIRMED_KEY, getNoticeHash(notice.value))
}

const openNotice = () => {
  if (!notice.value) return

  Modal.info({
    width: 560,
    title: t('header.notice.title'),
    content: notice.value,
    okText: t('button.confirm'),
    onOk: markNoticeConfirmed,
  })

  nextTick(() => {
    const noticeModals = document.querySelectorAll('.ivu-modal-confirm')
    const currentModal = noticeModals[noticeModals.length - 1]
    const noticeIcon = currentModal?.querySelector('.ivu-modal-confirm-head-icon i')
    if (noticeIcon) noticeIcon.className = 'iconfont icon-gonggao1'
    currentModal?.closest('.ivu-modal-wrap')?.classList.add('vertical-center-modal', 'notice-board-modal')
  })
}

watch(notice, (value) => {
  if (!value) return
  if (localStorage.getItem(NOTICE_CONFIRMED_KEY) === getNoticeHash(value)) return
  openNotice()
}, { immediate: true })
</script>

<style scoped lang="less">
.notice-trigger{
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-34);
  min-height: 32px;
  padding: 0;
  color: var(--primary-color);
  font: inherit;
  line-height: 1;
  border: 0;
  border-radius: var(--ui-radius-md);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover,
  &:focus-visible{
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 6%, var(--white-color));
    outline: none;
  }
}

@media (prefers-reduced-motion: reduce){
  .notice-trigger{
    transition: none;
  }
}
</style>

<style lang="less">
.notice-board-modal{
  .ivu-modal{
    max-width: calc(100% - 32px) !important;
    margin-inline: auto;
  }

  .ivu-modal-content{
    overflow: hidden;
    border-radius: var(--ui-radius-2xl);
    background: linear-gradient(180deg, var(--ui-color-surface-selected-strong), var(--ui-color-surface) 85%);
  }

  .ivu-modal-body,
  .ivu-modal-confirm{
    padding: 0;
  }

  .ivu-modal-confirm-head{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-space-8);
    padding: var(--ui-space-20);
  }

  .ivu-modal-confirm-head-icon{
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    flex-shrink: 0;
    line-height: 1;
    color: var(--primary-color);

    .iconfont{
      display: block;
      font-size: var(--ui-font-size-xl);
      line-height: 1;
    }
  }

  .ivu-modal-confirm-head-title{
    min-width: 0;
    margin: 0;
    color: var(--primary-color);
    font-size: var(--ui-font-size-xl);
    font-weight: var(--ui-font-weight-semibold);
    overflow-wrap: anywhere;
  }

  .ivu-modal-confirm-body{
    max-height: 60vh;
    margin: 0 var(--ui-space-16);
    padding: var(--ui-space-16);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-surface);
    overflow-y: auto;
    overscroll-behavior: contain;
    color: var(--ui-color-text);
    font-size: var(--ui-font-size-md);
    line-height: var(--ui-line-height-xl);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    text-align: start;
  }

  .ivu-modal-confirm-footer{
    margin: 0;
    padding: var(--ui-space-16) var(--ui-space-24);
    text-align: center;

    .ivu-btn{
      min-width: 96px;
      min-height: 36px;
    }
  }

  @media (max-width: 576px){
    .ivu-modal-confirm-footer{
      padding: var(--ui-space-16) var(--ui-space-20);
    }
  }
}
</style>
