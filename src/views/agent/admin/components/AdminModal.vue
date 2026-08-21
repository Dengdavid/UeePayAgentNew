<template>
  <Modal
    v-model="visible"
    :title="$t('agent.admin.modal.title')"
    width="600"
    class-name="vertical-center-modal admin-step-modal"
    :mask-closable="false"
    @on-visible-change="handleVisibleChange"
  >
    <div class="add-admin-modal">
      <div class="step-nav">
        <button type="button" :class="{ active: currentStep === 1, done: form.admin_uids }" @click="currentStep = 1">
          <span>1</span>
          <div>
            <em>{{ $t('agent.admin.modal.confirmUser') }}</em>
            <small>{{ $t('agent.admin.modal.confirmUserHint') }}</small>
          </div>
        </button>
        <button type="button" :class="{ active: currentStep === 2 }" :disabled="!form.admin_uids" @click="currentStep = 2">
          <span>2</span>
          <div>
            <em>{{ $t('agent.admin.modal.authorizeSites') }}</em>
            <small>{{ $t('agent.admin.modal.authorizeSitesHint') }}</small>
          </div>
        </button>
      </div>

      <section v-show="currentStep === 1" class="step-panel">
        <div class="section-title">
          <h4>{{ $t('agent.admin.modal.searchTitle') }}</h4>
          <p>{{ $t('agent.admin.modal.searchDescription') }}</p>
        </div>

        <div class="field-block query-card">
          <label>{{ $t('agent.admin.modal.userName') }} <b>*</b></label>
          <FormInput
            size="default"
            v-model="form.admin_name"
            :placeholder="$t('agent.admin.modal.userPlaceholder')"
            @on-change="handleKeywordChange"
            @on-enter="handleStepOne"
          ></FormInput>
          <p class="field-help">{{ $t('agent.admin.modal.searchHint') }}</p>
        </div>

        <div class="matched-user" v-if="matchedUser">
          <span class="matched-icon">
            <Icon custom="iconfont icon-CRMEB-fenxiaoyuan-mianxing" />
          </span>
          <div class="matched-info">
            <em>{{ $t('agent.admin.modal.confirmedAccount') }}</em>
            <strong>{{ matchedUserName }}</strong>
          </div>
          <Button type="text" size="small" @click="resetUser">{{ $t('agent.admin.modal.searchAgain') }}</Button>
        </div>
      </section>

      <section v-show="currentStep === 2" class="step-panel">
        <div class="section-title">
          <h4>{{ $t('agent.admin.modal.selectSites') }}</h4>
          <p>{{ $t('agent.admin.modal.selectSitesDescription') }}</p>
        </div>

        <div class="confirm-user">
          <span class="matched-icon">
            <Icon custom="iconfont icon-CRMEB-fenxiaoyuan-mianxing" />
          </span>
          <div class="matched-info">
            <em>{{ $t('agent.admin.modal.authorizeTo') }}</em>
            <strong>{{ matchedUserName }}</strong>
          </div>
        </div>

        <div class="field-block site-card">
          <div class="field-head">
            <label>{{ $t('agent.admin.modal.agentSites') }} <b>*</b></label>
            <span>{{ $t('agent.admin.modal.availableSites', { count: siteOptions.length }) }}<span v-if="selectedSiteCount">{{ $t('agent.admin.modal.selectedSites', { count: selectedSiteCount }) }}</span></span>
          </div>
          <FormSelectBox
            size="default"
            v-model="form.agent_site_ids"
            :placeholder="$t('agent.admin.modal.sitePlaceholder')"
            :options="siteOptions"
            :multiple="true"
          />
          <p class="field-help" v-if="siteOptions.length">{{ $t('agent.admin.modal.authorizationHint') }}</p>
          <p class="field-help is-error" v-else-if="!siteLoading">{{ $t('agent.admin.modal.noSites') }}</p>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="step-footer">
        <Button size="default" @click="handleCancel">{{ $t('agent.admin.modal.cancel') }}</Button>
        <div>
          <Button v-if="currentStep === 2" class="back-btn" size="default" @click="currentStep = 1">{{ $t('agent.admin.modal.previous') }}</Button>
          <Button
            v-if="currentStep === 1"
            type="primary"
            size="default"
            :loading="searchLoading"
            :disabled="!form.admin_name || searchLoading"
            @click="handleStepOne"
          >
            {{ $t('agent.admin.modal.searchContinue') }}
          </Button>
          <Button
            v-else
            type="primary"
            size="default"
            :loading="submitLoading"
            :disabled="!form.agent_site_ids || submitLoading"
            @click="submitAdd"
          >
            {{ $t('agent.admin.modal.confirmAdd') }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Button, Modal } from 'view-ui-plus'
import { getApi, postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'

const emit = defineEmits(['success'])

const visible = ref(false)
const currentStep = ref(1)
const siteOptions = ref([])
const matchedUser = ref(null)
const matchedKeyword = ref('')
const searchLoading = ref(false)
const submitLoading = ref(false)
const siteLoading = ref(false)

const form = reactive({
  admin_name: '',
  agent_site_ids: '',
  admin_uids: '',
})

const selectedSiteCount = computed(() => {
  return form.agent_site_ids ? form.agent_site_ids.split(',').filter(Boolean).length : 0
})

const matchedUserName = computed(() => {
  const user = matchedUser.value || {}
  return user.nickname || user.name || user.email || form.admin_name || '-'
})

const resetForm = () => {
  form.admin_name = ''
  form.agent_site_ids = ''
  form.admin_uids = ''
  matchedUser.value = null
  matchedKeyword.value = ''
  searchLoading.value = false
  submitLoading.value = false
  currentStep.value = 1
}

const resetUser = () => {
  form.admin_uids = ''
  form.agent_site_ids = ''
  matchedUser.value = null
  matchedKeyword.value = ''
  currentStep.value = 1
}

const getSites = () => {
  siteLoading.value = true
  return getApi('/user/agentSite/allSites').then((res) => {
    siteOptions.value = (res || []).map((item) => {
      return {
        label: item.site_name,
        value: item.id,
      }
    })
  }).catch((err) => {
    message(err?.msg || err, 'error')
  }).finally(() => {
    siteLoading.value = false
  })
}

const searchUser = () => {
  const keyword = String(form.admin_name || '').trim()
  if (!keyword) {
    message(t('agent.admin.modal.enterUser'), 'error')
    return Promise.resolve(false)
  }
  searchLoading.value = true
  form.admin_uids = ''
  form.agent_site_ids = ''
  matchedUser.value = null
  return getApi('/user/agentSite/searchUsers', {
    keyword,
  }).then((res) => {
    if (!res) {
      message(t('agent.admin.modal.userNotFound'), 'error')
      return false
    }
    matchedUser.value = res
    matchedKeyword.value = keyword
    form.admin_uids = res.id
    message(t('agent.admin.modal.userMatched'))
    return true
  }).catch((err) => {
    message(err?.msg || err, 'error')
    return false
  }).finally(() => {
    searchLoading.value = false
  })
}

const handleStepOne = async () => {
  if (form.admin_uids) {
    currentStep.value = 2
    return
  }
  const success = await searchUser()
  if (success) {
    currentStep.value = 2
  }
}

const handleKeywordChange = (value) => {
  if (!form.admin_uids) return
  const keyword = String(value || '').trim()
  if (keyword !== matchedKeyword.value) {
    resetUser()
    form.admin_name = keyword
  }
}

const submitAdd = () => {
  if (!form.admin_uids) {
    currentStep.value = 1
    message(t('agent.admin.modal.confirmAccountFirst'), 'error')
    return
  }
  if (!form.agent_site_ids) {
    message(t('agent.admin.modal.selectSiteFirst'), 'error')
    return
  }
  submitLoading.value = true
  postApi('/user/agentSite/addAdmin', {
    agent_site_ids: form.agent_site_ids,
    admin_uids: form.admin_uids,
  }).then(() => {
    message(t('agent.admin.modal.addSuccess'))
    visible.value = false
    emit('success')
  }).catch((err) => {
    message(err?.msg || err, 'error')
  }).finally(() => {
    submitLoading.value = false
  })
}

const handleCancel = () => {
  visible.value = false
}

const handleVisibleChange = (status) => {
  if (!status) {
    resetForm()
  }
}

const open = () => {
  resetForm()
  visible.value = true
  if (!siteOptions.value.length) {
    getSites()
  }
}

onMounted(() => {
  getSites()
})

defineExpose({
  open,
})
</script>

<style lang="less">
.admin-step-modal{
  .ivu-modal{
    border-radius: var(--ui-radius-lg);
    overflow: hidden;
  }

  .ivu-modal-header{
    padding: var(--ui-padding-16-20);
    border-bottom: 1px solid #edf0f5;
    background: #fbfcff;
  }

  .ivu-modal-header-inner{
    color: var(--ui-color-text);
    font-size: 15px;
    font-weight: 600;
  }

  .ivu-modal-body{
    padding: 18px 20px 20px;
    background: linear-gradient(180deg, #fbfcff 0%, #fff 40%);
  }

  .ivu-modal-footer{
    padding: 12px 20px;
    border-top: 1px solid #edf0f5;
    background: #fff;
  }

  .add-admin-modal{
    color: var(--ui-color-text);
  }

  .step-nav{
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: stretch;
    margin: 0 0 18px;
    border: var(--ui-border-muted);
    border-radius: var(--ui-radius-lg);
    background: #f7faff;
    overflow: hidden;
  }

  .step-nav button{
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 56px;
    padding: var(--ui-padding-10-14);
    border: 0;
    background: transparent;
    color: var(--ui-color-text-muted);
    text-align: left;
    cursor: pointer;
    transition: color .2s ease;
  }

  .step-nav button:disabled{
    cursor: not-allowed;
    opacity: .62;
  }

  .step-nav button.active,
  .step-nav button.done{
    color: var(--primary-color);
  }

  .step-nav span{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 28px;
    width: var(--ui-size-28);
    height: var(--ui-size-28);
    border: 1px solid #dce3ee;
    border-radius: var(--ui-radius-circle);
    background: #fff;
    box-shadow: 0 2px 8px rgba(18, 32, 66, 0.04);
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    transition: border-color .2s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease;
  }

  .step-nav button.active span,
  .step-nav button.done span{
    border-color: var(--primary-color);
    background: var(--primary-color);
    box-shadow: 0 6px 14px rgba(43, 92, 217, 0.18);
    color: var(--ui-color-text-inverse);
  }

  .step-nav em,
  .step-nav small{
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .step-nav em{
    color: var(--ui-color-text);
    font-size: 14px;
    line-height: 18px;
    font-style: normal;
    font-weight: 600;
  }

  .step-nav small{
    margin-top: 2px;
    color: var(--ui-color-text-muted);
    font-size: 12px;
    line-height: 16px;
  }

  .step-panel{
    min-height: 236px;
    padding: 4px 0 0;
    background: transparent;
  }

  .section-title{
    margin-bottom: 14px;
  }

  .section-title h4{
    margin: var(--ui-margin-0-0-4);
    color: var(--ui-color-text);
    font-size: 15px;
    line-height: 22px;
    font-weight: 600;
  }

  .section-title p{
    margin: 0;
    color: var(--ui-color-text-muted);
    font-size: 12px;
    line-height: 18px;
  }

  .field-block{
    margin-bottom: 14px;
  }

  .query-card,
  .site-card{
    padding: var(--ui-padding-12);
    border-radius: var(--ui-radius-lg);
    background: #f7faff;
  }

  .field-block label{
    display: inline-flex;
    align-items: center;
    margin-bottom: 8px;
    color: var(--ui-color-text);
    font-size: 13px;
    line-height: 20px;
    font-weight: 600;
  }

  .field-block label b{
    margin-left: 3px;
    color: var(--ui-color-error-strong);
  }

  .field-head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .field-head label{
    margin-bottom: 0;
  }

  .field-head span{
    color: var(--ui-color-text-muted);
    font-size: 12px;
    line-height: 18px;
  }

  .field-help{
    margin: 8px 0 0;
    color: var(--ui-color-text-muted);
    font-size: 12px;
    line-height: 18px;
  }

  .field-help.is-error{
    color: var(--ui-color-error-strong);
  }

  .ivu-input-wrapper,
  .ivu-select{
    width: 100%;
  }

  .matched-user,
  .confirm-user{
    display: flex;
    align-items: center;
    gap: 10px;
    padding: var(--ui-padding-12);
    border: 1px solid rgba(94, 176, 40, 0.18);
    border-radius: var(--ui-radius-lg);
    background: linear-gradient(90deg, rgba(94, 176, 40, 0.09) 0%, rgba(94, 176, 40, 0.025) 100%);
  }

  .confirm-user{
    margin-bottom: 14px;
  }

  .matched-icon{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 32px;
    width: var(--ui-size-32);
    height: var(--ui-size-32);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-success);
    color: var(--ui-color-text-inverse);
    font-size: 16px;
  }

  .matched-info{
    flex: 1;
    min-width: 0;
  }

  .matched-info em{
    display: block;
    color: var(--ui-color-neutral-700);
    font-size: 12px;
    line-height: 18px;
    font-style: normal;
  }

  .matched-info strong{
    display: block;
    overflow: hidden;
    color: var(--ui-color-text);
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .step-footer{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .step-footer > div{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    >*{
      margin: 0;
    }
  }
}

@media screen and (max-width: 480px) {
  .admin-step-modal{
    .ivu-modal{
      width: calc(100vw - 24px) !important;
    }

    .step-nav{
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .field-head{
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;
    }

    .matched-user,
    .confirm-user{
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .step-footer{
      align-items: center;
      flex-direction: row;
      gap: 8px;
    }

    .step-footer > div{
      display: flex;
      justify-content: stretch;
      flex: 1;
      width: 100%;
    }

    .step-footer > div .ivu-btn{
      flex: 1;
      min-width: 0;
    }

    .step-footer > div .back-btn{
      flex: 0 0 88px;
      width: var(--ui-size-88);
    }

    .step-footer > .ivu-btn{
      flex: 0 0 88px;
      width: var(--ui-size-88);
    }
  }
}
</style>
