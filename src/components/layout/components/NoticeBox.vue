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
    title: t('header.notice.title'),
    content: notice.value,
    okText: t('button.confirm'),
    onOk: markNoticeConfirmed,
  })

  nextTick(() => {
    const noticeModals = document.querySelectorAll('.ivu-modal-confirm')
    const currentModal = noticeModals[noticeModals.length - 1]
    currentModal?.closest('.ivu-modal-wrap')?.classList.add('vertical-center-modal')
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
