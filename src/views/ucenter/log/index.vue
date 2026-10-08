<template>
  <UiPage :data="data" row-key="id" />
</template>

<script setup>
import { useUserStoreRefs } from '@/utils/store'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { format, subMonths } from 'date-fns'
import { getApi, postApi } from '@/utils/api.js'
import { message, showRequestError } from '@/utils/message.js'
import { getCalendarDateInTimezone } from '@/utils/preferences.js'
import { t } from '@/utils'

const { user } = useUserStoreRefs()
const exportLoading = ref(false)
const today = getCalendarDateInTimezone()
const search = reactive({
  start_time: format(subMonths(today, 1), 'yyyy-MM-dd'),
  end_time: format(today, 'yyyy-MM-dd'),
  // risk_level: '',
  // operator_type: '',
  // module: '',
  // action: '',
  // keyword: '',
})

const accountTypeValues = ['system', 'user', 'sub_user']
const accountTypeOptions = computed(() => accountTypeValues.map((value) => ({
  value,
  label: t(`auditLog.accountTypes.${value}`),
})))
const logTypeOptions = ref([])
const modulesController = new AbortController()
onMounted(() => {
  getApi('/user/AuditLog/modules', {}, { signal: modulesController.signal })
    .then((modules) => {
      if (modulesController.signal.aborted) return
      logTypeOptions.value = modules.map(({ key, name }) => ({
        value: key,
        label: name,
      }))
    })
    .catch(showRequestError)
})
onBeforeUnmount(() => modulesController.abort())

const handleLogTypeChange = (value) => {
  search.module = value
}

const riskLevelValues = ['0', '1']
const riskLevelKeys = {
  0: 'normal',
  1: 'sensitive',
}
const riskLevelOptions = computed(() => riskLevelValues.map((value) => ({
  value,
  label: t(`auditLog.riskLevels.${riskLevelKeys[value]}`),
})))
const handleExport = () => {
  if (exportLoading.value) return

  exportLoading.value = true
  postApi('/user/AuditLog/export', { ...search })
    .then(() => message(t('auditLog.exportCreated')))
    .catch(showRequestError)
    .finally(() => {
      exportLoading.value = false
    })
}

const data = computed(() => ({
  apiUrl: '/user/AuditLog/index',
  statusKey: 'module',
  status: [
    { label: t('auditLog.all'), value: '' },
    ...logTypeOptions.value,
  ],
  onStatusChange: handleLogTypeChange,
  search,
  searchThead: [
    {
      label: t('auditLog.dateRange'),
      type: 'daterange',
      startKey: 'start_time',
      endKey: 'end_time',
      maxMonths: 1,
      clearable: false,
      width: 230,
    },
    ...(!user.value?.parent_uid ? [{
      label: t('auditLog.accountType'),
      prop: 'operator_type',
      type: 'select',
      options: accountTypeOptions.value,
      placeholder: t('auditLog.accountType'),
      clearable: true,
      width: 120,
    }] : []),
    {
      label: t('auditLog.riskLevel'),
      prop: 'risk_level',
      type: 'select',
      options: riskLevelOptions.value,
      placeholder: t('auditLog.riskLevel'),
      clearable: true,
      width: 120,
    },
    ...(!user.value?.parent_uid ? [{
      label: t('auditLog.accountName'),
      prop: 'keyword',
      type: 'input',
      autocomplete: 'off',
      name: 'audit-log-search',
      placeholder: t('auditLog.accountName'),
      clearable: true,
      width: 200,
    }] : []),
  ],
  btns: [
    {
      label: t('auditLog.export'),
      icon: 'md-download',
      loading: exportLoading.value,
      click: handleExport,
    },
  ],
  thead: [
    {
      label: t('auditLog.createdAt'),
      prop: 'created_at',
      width: 180,
      wapType: 'title',
    },
    ...(!user.value?.parent_uid ? [{
      label: t('auditLog.operator'),
      prop: 'operator_name',
      width: 140,
      value: (row) => row.operator_name || t('auditLog.unknownOperator'),
    }] : []),
    ...(!user.value?.parent_uid ? [{
      label: t('auditLog.accountType'),
      prop: 'operator_type',
      width: 120,
      value: (row) => row.operator_type === '' ? '-' : row.operator_type ?? '-',
    }] : []),
    {
      label: t('auditLog.logType'),
      prop: 'module',
      width: 140,
      value: (row) => row.module === '' ? '-' : row.module ?? '-',
    },
    {
      label: t('auditLog.action'),
      prop: 'action',
      width: 180,
      value: (row) => row.action === '' ? '-' : row.action ?? '-',
    },
    {
      label: t('auditLog.target'),
      prop: 'target_name',
      width: 160,
      value: (row) => row.target_name || '-',
    },
    {
      label: t('auditLog.riskLevel'),
      prop: 'risk_level',
      width: 110,
      fixed: 'right',
      value: (row) => row.risk_level === '' ? '-' : row.risk_level ?? '-',
    },
    {
      label: t('auditLog.result'),
      prop: 'result',
      width: 110,
      fixed: 'right',
      value: (row) => row.result === '' ? '-' : row.result ?? '-',
    },
    {
      label: t('auditLog.ipAddress'),
      prop: 'ip',
      width: 150,
      value: (row) => row.ip || '-',
    },
    {
      label: t('auditLog.description'),
      prop: 'description',
      minWidth: 320,
      autoWidth: false,
      value: (row) => row.description || '-',
    },
  ],
}))
</script>
