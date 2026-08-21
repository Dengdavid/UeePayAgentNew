import { t } from '@/utils'

const status = [
  {
    label: t('cashback.status.pending'),
    value: 0,
    type: 'primary',
  },
  {
    label: t('cashback.status.confirmed'),
    value: 1,
    type: 'success',
  },
  {
    label: t('cashback.status.appealing'),
    value: 2,
    type: 'error',
  },
]
const formatCashbackDate = (dateStr) => {
  if (!dateStr) return ''
  // 如果是 2025-05-01 格式，提取年月部分
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-')
    return `${parts[0]}-${parts[1]}`
  }
  return dateStr
}
export {status,formatCashbackDate}
