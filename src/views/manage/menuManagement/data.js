import { t } from '@/utils'

export const getMenuOpenTypeOptions = () => [
  { label: t('menuManagement.openTypeInternal'), value: 0 },
  { label: t('menuManagement.openTypeExternal'), value: 1 },
]

export const getMenuStatusOptions = () => [
  { label: t('menuManagement.enable'), value: 1, type: 'success' },
  { label: t('menuManagement.disable'), value: 0, type: 'default' },
]
