<template>
  <UiPage
    isBack
    :back-handler="backToRoles"
    :fallback="{ name: 'ucenterAccount', query: { type: 'role' } }"
  >
    <div v-if="loading" class="permission-state permission-state--loading">
      <Spin />
    </div>
    <div v-else-if="loadError" class="permission-state permission-state--error">
      <span>{{ $t(loadError) }}</span>
      <Button type="text" @click="loadPageData">{{ $t('button.refresh') }}</Button>
    </div>
    <Form v-else-if="loaded" ref="formRef" :model="form" label-position="top" :show-message="false" @submit.prevent="submitRole">
      <Alert v-if="isReadonly" type="info" show-icon>
        {{ $t(isSystemRole ? 'ucenterAccount.permission.systemRoleReadonly' : 'ucenterAccount.permission.roleReadonly') }}
      </Alert>
      <FormItemBox
        :label="$t('ucenterAccount.field.roleName')"
        prop="name"
        :isRequired="!isReadonly"
        :rules="{ max: 50 }"
      >
        <FormInput
          size="large"
          v-model="form.name"
          :disabled="isFormDisabled"
          :maxlength="50"
          :placeholder="$t('ucenterAccount.roleForm.namePlaceholder')"
        />
      </FormItemBox>

      <FormItemBox
        :label="$t('ucenterAccount.field.roleDescription')"
        prop="description"
        :rules="{ max: 200 }"
      >
        <FormInput
          size="large"
          v-model="form.description"
          :disabled="isFormDisabled"
          type="textarea"
          :rows="3"
          :maxlength="200"
          :placeholder="$t('ucenterAccount.roleForm.descriptionPlaceholder')"
        />
      </FormItemBox>
      <FormItemBox
        :label="$t('ucenterAccount.roleForm.permissions')"
        prop="permission_ids"
      >
        <div v-if="permissionGroups.length === 0" class="permission-state">
          {{ $t('ucenterAccount.roleForm.emptyPermissions') }}
        </div>
        <div v-else class="permission-config">
          <div class="permission-select-all">
            <Checkbox
              :model-value="allPermissionState.checked"
              :indeterminate="allPermissionState.indeterminate"
              :disabled="isFormDisabled || allPermissionIds.length === 0"
              @on-change="toggleAllPermissions"
            >
              <span>{{ $t('ucenterAccount.memberPicker.selectAllInList') }}</span>
            </Checkbox>
          </div>
          <RolePermissionTree
            :nodes="permissionGroups"
            :selected-ids="form.permission_ids"
            :readonly="isFormDisabled"
            :readonly-page-ids="readonlyPageIds"
            @toggle="handlePermissionTreeToggle"
            @toggle-readonly="handlePageReadonlyToggle"
          />
        </div>
      </FormItemBox>
      <div v-if="!isReadonly" class="form-footer">
        <UiAffix :offset-bottom="10">
          <div class="form-actions">
            <div class="form-errors" role="alert" aria-live="polite">
              <p v-if="submitHint">{{ submitHint }}</p>
            </div>
            <div class="form-action-buttons">
              <Button type="primary" :loading="submitLoading" :disabled="isFormDisabled || !!submitHint" @click="submitRole">
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
import { t } from '@/utils/index.js'
import { hasPermission } from '@/utils/permission.js'
import { message, showRequestError } from '@/utils/message.js'
import { isRecoveryRoute, toRoute, useRoute } from '@/utils/route.js'
import RolePermissionTree from '../../RolePermissionTab/RolePermissionTree.vue'

const route = useRoute()
const formRef = ref(null)
const form = ref({ name: '', description: '', permission_ids: [] })
const loading = ref(false)
const loaded = ref(false)
const submitLoading = ref(false)
const loadError = ref('')
const isSystemRole = ref(false)
const readonlyPageIds = ref([])
const permissionGroups = ref([])
let permissionNodeMap = new Map()
let loadController = null
let loadAttemptId = 0

const isEdit = computed(() => route.name === 'ucenterAccountRoleEdit')
const roleId = computed(() => {
  if (!isEdit.value) return null
  const id = Number(route.params.id)
  return /^\d+$/.test(String(route.params.id)) && Number.isSafeInteger(id) && id > 0 ? id : null
})
const isReadonly = computed(() => isSystemRole.value || !hasPermission(isEdit.value ? 'team.role.update' : 'team.role.create'))
const isFormDisabled = computed(() => isReadonly.value || loading.value || !loaded.value || submitLoading.value)
const submitHint = computed(() => {
  if (!form.value.name.trim()) return t('validate.required', { field: t('ucenterAccount.field.roleName') })
  if (form.value.name.length > 50) return t('validate.maxLength', { field: t('ucenterAccount.field.roleName'), max: 50 })
  if (form.value.description.length > 200) return t('validate.maxLength', { field: t('ucenterAccount.field.roleDescription'), max: 200 })
  return ''
})

const isPermissionEnabled = (node) => node?.status === undefined || Number(node.status) === 1

const normalizePermissionTree = (nodes, ancestorIds = []) => {
  if (!Array.isArray(nodes)) return []
  return nodes
    .filter((node) => node && Number(node.id) > 0)
    .map((node) => {
      const id = Number(node.id)
      return {
        ...node,
        id,
        ancestorIds: [...ancestorIds],
        children: normalizePermissionTree(node.children, [...ancestorIds, id]),
      }
    })
}

const getPermissionNodeSelectableIds = (node, ancestorDisabled = false) => {
  const disabled = ancestorDisabled || !isPermissionEnabled(node)
  if (disabled) return []

  return [
    node.id,
    ...(node.children || []).flatMap((child) => {
      return getPermissionNodeSelectableIds(child, disabled)
    }),
  ]
}

const allPermissionIds = computed(() => {
  return permissionGroups.value.flatMap((group) => getPermissionNodeSelectableIds(group))
})

const indexPermissionNodes = (nodes) => {
  const nodeMap = new Map()
  const visit = (items) => {
    for (const node of items || []) {
      nodeMap.set(node.id, node)
      visit(node.children)
    }
  }
  visit(nodes)
  permissionNodeMap = nodeMap
}

const setPermissionIds = (permissionIds) => {
  const selectedIds = new Set(permissionIds)
  form.value.permission_ids = [...selectedIds].sort((a, b) => a - b)
  readonlyPageIds.value = [...permissionNodeMap.values()]
    .filter((node) => (Number(node.type) === 0 || node.children.length > 0)
      && !node.children.some((child) => Number(child.type) === 0 || child.children.length > 0)
      && selectedIds.has(node.id)
      && !node.children.some((child) => selectedIds.has(child.id)))
    .map((node) => node.id)
}

const toggleAllPermissions = (checked) => {
  if (isFormDisabled.value) return
  const selectedIds = checked ? new Set(allPermissionIds.value) : new Set()
  setPermissionIds(selectedIds)
}

const handlePermissionTreeToggle = ({ node, checked }) => {
  if (isFormDisabled.value) return
  const selectedIds = new Set(form.value.permission_ids.map(Number))
  const ancestorDisabled = (node.ancestorIds || []).some((ancestorId) => {
    const ancestor = permissionNodeMap.get(ancestorId)
    return !ancestor || !isPermissionEnabled(ancestor)
  })
  if (ancestorDisabled || !isPermissionEnabled(node)) return
  const nodeIds = getPermissionNodeSelectableIds(
    node,
    ancestorDisabled,
  )

  for (const id of nodeIds) {
    if (checked) {
      selectedIds.add(id)
    } else {
      selectedIds.delete(id)
    }
  }
  if (checked) {
    for (const ancestorId of node.ancestorIds || []) {
      const ancestor = permissionNodeMap.get(ancestorId)
      if (ancestor && isPermissionEnabled(ancestor)) {
        selectedIds.add(ancestorId)
      }
    }
  } else {
    const ancestorIds = [...(node.ancestorIds || [])].reverse()
    for (const ancestorId of ancestorIds) {
      const ancestor = permissionNodeMap.get(ancestorId)
      if (!ancestor?.children.some((child) => Number(child.type) === 0 || child.children.length > 0)) continue
      const descendantIds = getPermissionNodeSelectableIds(ancestor).filter((id) => id !== ancestorId)
      if (!descendantIds.some((id) => selectedIds.has(id))) {
        selectedIds.delete(ancestorId)
      }
    }
  }

  setPermissionIds(selectedIds)
}

const clearPermissionSelection = () => {
  setPermissionIds([])
}

const applyPermissionSelection = (permissionIds = []) => {
  clearPermissionSelection()
  const requestedIds = new Set(
    (Array.isArray(permissionIds) ? permissionIds : [])
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0),
  )

  const selectedIds = new Set(
    allPermissionIds.value.filter((id) => requestedIds.has(id)),
  )
  setPermissionIds(selectedIds)
}

const handlePageReadonlyToggle = ({ node, checked }) => {
  if (isFormDisabled.value || !isPermissionEnabled(node)) return
  if ((node.ancestorIds || []).some((id) => !permissionNodeMap.has(id) || !isPermissionEnabled(permissionNodeMap.get(id)) || readonlyPageIds.value.includes(id))) return
  const otherReadonlyPageIds = readonlyPageIds.value.filter((id) => id !== node.id)
  handlePermissionTreeToggle({ node, checked: true })
  const buttonIds = node.children.map((child) => child.id)
  setPermissionIds(new Set(form.value.permission_ids.filter((id) => !buttonIds.includes(id))))
  readonlyPageIds.value = checked ? [...otherReadonlyPageIds, node.id] : otherReadonlyPageIds
}

const allPermissionState = computed(() => {
  const selectedIds = new Set(form.value.permission_ids.map(Number))
  const selectedCount = allPermissionIds.value
    .filter((id) => selectedIds.has(id))
    .length
  return {
    checked: allPermissionIds.value.length > 0
      && selectedCount === allPermissionIds.value.length,
    indeterminate: selectedCount > 0
      && selectedCount < allPermissionIds.value.length,
  }
})

const loadPageData = async () => {
  const attemptId = ++loadAttemptId
  loadController?.abort()
  loadController = null
  loading.value = false
  loaded.value = false
  submitLoading.value = false
  loadError.value = ''
  isSystemRole.value = false
  form.value = { name: '', description: '', permission_ids: [] }
  permissionGroups.value = []
  permissionNodeMap = new Map()
  readonlyPageIds.value = []

  if (!['ucenterAccountRoleCreate', 'ucenterAccountRoleEdit'].includes(route.name)) return
  if (!hasPermission('team.view') || !hasPermission('team.role.view') || (!isEdit.value && !hasPermission('team.role.create'))) {
    toRoute('error_403', {}, 'query', { replace: true })
    return
  }
  const id = roleId.value
  if (isEdit.value && !id) {
    toRoute('error_404', {}, 'query', { replace: true })
    return
  }

  const controller = new AbortController()
  loadController = controller
  loading.value = true
  let errorKey = 'ucenterAccount.roleForm.permissionsLoadFailed'
  try {
    const response = await userApi.getTeamRolePermissions({ signal: controller.signal })
    if (attemptId !== loadAttemptId) return
    permissionGroups.value = normalizePermissionTree(Array.isArray(response) ? response : response?.list)
    indexPermissionNodes(permissionGroups.value)
    if (id) {
      errorKey = 'ucenterAccount.roleForm.detailLoadFailed'
      const detail = await userApi.getTeamRoleDetail({ role_id: id }, { signal: controller.signal })
      if (attemptId !== loadAttemptId) return
      if (!detail || typeof detail !== 'object' || Array.isArray(detail)) throw new Error('Invalid role detail')
      isSystemRole.value = Number(detail.is_system) === 1
      form.value = { name: detail.name || '', description: detail.description || '', permission_ids: [] }
      applyPermissionSelection(detail.permission_ids)
    }
    loaded.value = true
  } catch (error) {
    if (attemptId !== loadAttemptId || controller.signal.aborted) return
    loadError.value = errorKey
  } finally {
    if (attemptId === loadAttemptId) {
      loading.value = false
      loadController = null
    }
  }
}

const backToRoles = () => toRoute('ucenterAccount', { type: 'role' }, 'query', { replace: true })

const submitRole = async () => {
  if (isFormDisabled.value || loadError.value || !formRef.value) return
  const attemptId = loadAttemptId
  const id = roleId.value
  submitLoading.value = true
  try {
    const valid = await formRef.value?.validate()
    if (!valid || attemptId !== loadAttemptId || isReadonly.value) return
    const payload = {
      name: form.value.name,
      description: form.value.description,
      permission_ids: [...form.value.permission_ids],
    }
    if (id) {
      await userApi.updateTeamRole({ role_id: id, ...payload })
    } else {
      await userApi.createTeamRole(payload)
    }
    if (attemptId !== loadAttemptId) return
    message(t(id ? 'ucenterAccount.message.updated' : 'ucenterAccount.message.created'))
    submitLoading.value = false
    await backToRoles()
  } catch (error) {
    showRequestError(error)
  } finally {
    if (attemptId === loadAttemptId) submitLoading.value = false
  }
}

onBeforeRouteLeave(to => isRecoveryRoute(to) || !submitLoading.value)
onBeforeRouteUpdate(to => isRecoveryRoute(to) || !submitLoading.value)
watch(() => [route.name, route.params.id], loadPageData, { immediate: true, flush: 'sync' })

onBeforeUnmount(() => {
  loadAttemptId += 1
  loadController?.abort()
})
</script>

<style scoped lang="less">
.form-footer { margin-top: var(--ui-space-24); padding-bottom: calc(var(--ui-space-16) + env(safe-area-inset-bottom, 0px)); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-16); padding: var(--ui-padding-16-24); background: var(--ui-color-surface); border: var(--ui-border-subtle); border-radius: var(--ui-radius-lg); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); }
.form-action-buttons { display: flex; flex-shrink: 0; gap: var(--ui-space-12); }
.form-action-buttons :deep(.ivu-btn) { min-height: var(--ui-size-42); border-radius: var(--ui-radius-24); }
.form-action-buttons :deep(.ivu-btn-primary) { min-width: var(--ui-size-160); font-weight: 600; }
.form-errors { flex: 1; min-width: 0; color: var(--ui-color-error); font-size: var(--ui-font-size-xs); line-height: var(--ui-line-height-md); overflow-wrap: anywhere; }
.form-errors p { margin: 0; }

.permission-config {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-8);
  padding: var(--ui-space-8);
  border: 1px solid var(--ui-color-border-subtle);
  border-radius: var(--ui-radius-3);
}

.permission-select-all {
  display: flex;
  align-items: center;
}

:deep(.permission-select-all .ivu-checkbox-wrapper) {
  display: flex;
  align-items: center;
  margin-right: 0;
}

:deep(.permission-select-all .ivu-checkbox-label-text) {
  min-width: 0;
  padding-left: var(--ui-space-8);
}

.permission-state {
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-8);
  padding: var(--ui-space-16);
  border: 1px solid var(--ui-color-border-subtle);
  border-radius: var(--ui-radius-3);
  color: var(--ui-color-text-secondary);
}

.permission-state--loading {
  border: 0;
}

.permission-state--error {
  flex-direction: column;
}

@media screen and (max-width: 768px) {
  .form-actions { flex-direction: column; align-items: stretch; padding: var(--ui-padding-12-16); }
  .form-errors:empty { display: none; }
  .form-action-buttons :deep(.ivu-btn) { flex: 1; min-width: 0; min-height: var(--ui-size-44); }
  .permission-select-all {
    min-height: var(--ui-size-44);
  }
}
</style>
