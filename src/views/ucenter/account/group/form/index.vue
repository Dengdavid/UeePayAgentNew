<template>
  <UiPage isBack :back-handler="backToGroups" :fallback="{ name: 'ucenterAccount', query: { type: 'group' } }">
    <LoadingBox v-if="loading || membersLoading" />
    <div v-else-if="loadError" role="alert">
      <UiNotice>{{ loadError }}</UiNotice>
      <Button @click="loadPage">{{ $t('button.refresh') }}</Button>
    </div>
    <Form v-if="loaded && canManage && !loadError" v-show="!loading && !membersLoading" ref="formRef" :model="form" label-position="top" :show-message="false" @submit.prevent="submit">
      <fieldset :disabled="submitLoading">
        <FormItemBox :label="$t('ucenterAccount.groupForm.name')" prop="name" isRequired :rules="{ max: 50 }">
          <FormInput v-model="form.name" size="large" :disabled="submitLoading" :maxlength="50" :placeholder="$t('ucenterAccount.groupForm.namePlaceholder')" />
        </FormItemBox>
        <FormItemBox :label="$t('ucenterAccount.groupForm.description')" prop="description" :rules="{ max: 200 }">
          <FormInput v-model="form.description" size="large" type="textarea" :rows="3" :disabled="submitLoading" :maxlength="200" :placeholder="$t('ucenterAccount.groupForm.descriptionPlaceholder')" />
        </FormItemBox>
        <FormItemBox
          v-if="$hasPermission('team.account.view')"
          :label="$t('ucenterAccount.memberPicker.fieldLabel')"
          prop="account_ids"
          :labelSub="$t('ucenterAccount.memberPicker.description')"
        >
          <AccountMemberPicker v-model="form.account_ids" :active="loaded && canManage" @loading-change="membersLoading = $event" />
        </FormItemBox>
      </fieldset>
      <div class="form-footer">
        <UiAffix :offset-bottom="10">
          <div class="form-actions">
            <div class="form-errors" role="alert" aria-live="polite">
              <p v-if="submitHint">{{ submitHint }}</p>
            </div>
            <div class="form-action-buttons">
              <Button type="primary" :loading="submitLoading" :disabled="!canManage || submitLoading || !!submitHint" @click="submit">
                <span>{{ $t('button.save') }}</span>
              </Button>
            </div>
          </div>
        </UiAffix>
      </div>
    </Form>
  </UiPage>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { userApi } from '@/api'
import { t } from '@/utils'
import { hasPermission } from '@/utils/permission.js'
import { message, showRequestError } from '@/utils/message.js'
import { isRecoveryRoute, toRoute, useRoute } from '@/utils/route.js'
import { normalizeAccountIds } from '../../GroupManagementTab/data.js'
import AccountMemberPicker from '../../GroupManagementTab/AccountMemberPicker.vue'

const route = useRoute()
const formRef = ref(null)
const form = ref({ name: '', description: '', account_ids: [] })
const loading = ref(false)
const membersLoading = ref(false)
const loaded = ref(false)
const loadError = ref('')
const submitLoading = ref(false)
const isSystemGroup = ref(false)
let detailController = null
let loadVersion = 0

const editing = computed(() => route.name === 'ucenterAccountGroupEdit')
const groupId = computed(() => editing.value ? Number(route.params.id) : null)
const canManage = computed(() => !isSystemGroup.value && hasPermission('team.view') && hasPermission('team.group.view') && hasPermission(editing.value ? 'team.group.update' : 'team.group.create'))
const submitHint = computed(() => {
  if (!form.value.name.trim()) return t('validate.required', { field: t('ucenterAccount.groupForm.name') })
  if (form.value.name.length > 50) return t('validate.maxLength', { field: t('ucenterAccount.groupForm.name'), max: 50 })
  if (form.value.description.length > 200) return t('validate.maxLength', { field: t('ucenterAccount.groupForm.description'), max: 200 })
  return ''
})
const backToGroups = () => {
  if (!editing.value && route.query.returnTo === 'cardSharedWalletAdd') {
    return toRoute('cardSharedWalletAdd', {}, 'query', { replace: true })
  }
  if (!editing.value && route.query.returnTo === 'cardSharedWalletEdit' && typeof route.query.walletId === 'string' && route.query.walletId) {
    return toRoute('cardSharedWalletEdit', { id: route.query.walletId }, 'params', { replace: true })
  }
  return toRoute('ucenterAccount', { type: 'group' }, 'query', { replace: true })
}

const loadPage = async () => {
  const version = ++loadVersion
  detailController?.abort()
  detailController = null
  loaded.value = false
  loading.value = false
  membersLoading.value = false
  loadError.value = ''
  isSystemGroup.value = false
  form.value = { name: '', description: '', account_ids: [] }
  if (!['ucenterAccountGroupCreate', 'ucenterAccountGroupEdit'].includes(route.name)) return
  if (!canManage.value) {
    toRoute('error_403', {}, 'query', { replace: true })
    return
  }
  if (!editing.value) {
    membersLoading.value = hasPermission('team.account.view')
    loaded.value = true
    return
  }
  const id = groupId.value
  if (!/^\d+$/.test(String(route.params.id)) || !Number.isSafeInteger(id) || id <= 0) {
    toRoute('error_404', {}, 'query', { replace: true })
    return
  }
  const controller = new AbortController()
  detailController = controller
  loading.value = true
  try {
    const detail = await userApi.getTeamGroupDetail({ group_id: id }, { signal: controller.signal })
    if (version !== loadVersion || controller.signal.aborted) return
    if (!detail || typeof detail !== 'object' || Array.isArray(detail) || (detail.id != null && Number(detail.id) !== id)) throw new Error('Invalid group detail')
    isSystemGroup.value = Number(detail.is_system) === 1
    if (!canManage.value) {
      toRoute('error_403', {}, 'query', { replace: true })
      return
    }
    form.value = {
      name: detail.name || '',
      description: detail.description || '',
      account_ids: normalizeAccountIds(detail.account_ids),
    }
    membersLoading.value = hasPermission('team.account.view')
    loaded.value = true
  } catch (error) {
    if (version !== loadVersion || controller.signal.aborted) return
    loadError.value = !error?.silent && error?.msg && error.msg !== 'SILENT_ERROR' ? error.msg : t('ucenterAccount.groupForm.loadFailed')
  } finally {
    if (version === loadVersion) {
      detailController = null
      loading.value = false
    }
  }
}

const submit = async () => {
  if (!canManage.value || !loaded.value || loading.value || membersLoading.value || loadError.value || submitLoading.value || !formRef.value) return
  const version = loadVersion
  const id = groupId.value
  submitLoading.value = true
  try {
    if (!await formRef.value.validate() || version !== loadVersion || !canManage.value) return
    const payload = {
      name: form.value.name,
      description: form.value.description,
      account_ids: normalizeAccountIds(form.value.account_ids),
    }
    if (id) await userApi.updateTeamGroup({ group_id: id, ...payload })
    else await userApi.createTeamGroup(payload)
    if (version !== loadVersion) return
    message(t(id ? 'ucenterAccount.message.updated' : 'ucenterAccount.message.created'))
    submitLoading.value = false
    await backToGroups()
  } catch (error) {
    showRequestError(error)
  } finally {
    if (version === loadVersion) submitLoading.value = false
  }
}

onBeforeRouteLeave(to => isRecoveryRoute(to) || !submitLoading.value)
onBeforeRouteUpdate(to => isRecoveryRoute(to) || !submitLoading.value)
watch(() => [route.name, route.params.id], loadPage, { immediate: true, flush: 'sync' })
onBeforeUnmount(() => {
  loadVersion += 1
  detailController?.abort()
})
</script>

<style scoped lang="less">
fieldset { min-width: 0; padding: 0; border: 0; }
fieldset > :deep(.ivu-form-item:last-child) { margin-bottom: 0; }
.form-footer { margin-top: var(--ui-space-24); padding-bottom: calc(var(--ui-space-16) + env(safe-area-inset-bottom, 0px)); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-16); padding: var(--ui-padding-16-24); background: var(--ui-color-surface); border: var(--ui-border-subtle); border-radius: var(--ui-radius-lg); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); }
.form-action-buttons { display: flex; flex-shrink: 0; gap: var(--ui-space-12); }
.form-action-buttons :deep(.ivu-btn) { min-height: var(--ui-size-42); border-radius: var(--ui-radius-24); }
.form-action-buttons :deep(.ivu-btn-primary) { min-width: var(--ui-size-160); font-weight: 600; }
.form-errors { flex: 1; min-width: 0; color: var(--ui-color-error); font-size: var(--ui-font-size-xs); line-height: var(--ui-line-height-md); overflow-wrap: anywhere; }
.form-errors p { margin: 0; }

@media (max-width: 768px) {
  .form-actions { flex-direction: column; align-items: stretch; padding: var(--ui-padding-12-16); }
  .form-errors:empty { display: none; }
  .form-action-buttons :deep(.ivu-btn) { flex: 1; min-width: 0; min-height: var(--ui-size-44); }
}
</style>
