import { t } from '@/utils'
import { copyText } from '@/utils/dataInfo.js'

/**
 * 账单状态展示配置。
 *
 * `label` 用于列表和复制内容的多语言展示，`type` 对应状态组件的视觉类型。
 * 未在此处声明的服务端状态应由调用方保留原始值，避免展示为空。
 */
export const statusOptions = {
  Pending: { label: t('card.index.bills.status.success'), type: 'success' },
  Fail: { label: t('card.index.bills.status.failed'), type: 'error' },
  Closed: { label: t('card.index.bills.status.completed'), type: 'success' },
  SUCCESS: { label: t('card.index.bills.status.success'), type: 'success' },
}
export const transactionStatusValues = Object.keys(statusOptions).filter((value) => value !== 'SUCCESS')

/**
 * 服务端支持的卡片交易类型枚举。
 *
 * 该列表同时用于生成筛选选项和交易类型文案映射；新增服务端枚举时需要同步补充语言包。
 */
export const transactionTypeValues = [
  'Create',
  'TransferIn',
  'Verification',
  'Consumption',
  'Reversal',
  'Credit',
  'TransferOut',
  'Suspend',
  'Enable',
  'Penalty',
  'Fee_Consumption',
  'Monthly',
  'Destroy',
]

/**
 * 可直接用于 Select、状态筛选等组件的交易类型选项。
 */
export const transactionTypes = transactionTypeValues.map((value) => ({
  value,
  label: t(`card.index.bills.typeMap.${value}`),
}))

/**
 * 交易类型值到多语言展示文案的快速映射。
 */
export const transactionTypeMap = Object.fromEntries(transactionTypes.map((item) => [item.value, item.label]))

/**
 * 服务端账单状态到语言包状态 key 的映射。
 */
export const statusKeyMap = {
  Pending: 'success',
  Fail: 'failed',
  Closed: 'completed',
  SUCCESS: 'success',
}

/**
 * 对可能包含完整 PAN 的卡号进行脱敏。
 *
 * 仅处理去除空格和连字符后为 12～19 位纯数字的值；已经脱敏或格式未知的值保持原样。
 *
 * @param {string | number | null | undefined} cardNumber 卡号或服务端返回的卡号展示值
 * @returns {string} 脱敏后的卡号展示值
 */
export const maskCardNumber = (cardNumber) => {
  const value = String(cardNumber ?? '').trim()
  const normalized = value.replace(/[\s-]/g, '')

  if (!/^\d{12,19}$/.test(normalized)) return value

  return `${normalized.slice(0, 6)}******${normalized.slice(-4)}`
}

/**
 * 获取交易类型的多语言文案，未知枚举保留服务端原值。
 *
 * @param {string} type 服务端交易类型
 * @returns {string} 面向用户的交易类型文案
 */
const getTransactionType = (type) => {
  if (!type) return ''
  if (!transactionTypeValues.includes(type)) return type
  return t(`card.index.bills.typeMap.${type}`)
}

/**
 * 获取账单状态的多语言文案，未知状态保留服务端原值。
 *
 * @param {string} status 服务端账单状态
 * @returns {string} 面向用户的状态文案
 */
const getStatusText = (status) => {
  if (!status) return ''
  const statusKey = statusKeyMap[status]
  return statusKey ? t(`card.index.bills.status.${statusKey}`) : status
}

/**
 * 生成一行“字段名: 字段值”格式的多语言复制文本。
 *
 * @param {string} labelKey `card.index.bills.copyFields` 下的字段 key
 * @param {*} value 字段值
 * @returns {string} 单行复制文本
 */
const createCopyLine = (labelKey, value) => `${t(`card.index.bills.copyFields.${labelKey}`)}: ${value ?? ''}`

/**
 * 将账单摘要复制到系统剪贴板。
 *
 * 复制前会对完整纯数字卡号进行脱敏；金额使用接口原值，避免在复制工具内进行浮点运算。
 *
 * @param {Object} row 账单列表行数据
 * @returns {void}
 */
export const copyCard = (row = {}) => {
  const lines = [
    createCopyLine('billId', row.id),
    createCopyLine('transactionTime', row.transaction_time),
    createCopyLine('cardNumber', maskCardNumber(row.card_no)),
    createCopyLine('status', getStatusText(row.status)),
    createCopyLine('transactionType', getTransactionType(row.type)),
    createCopyLine('transactionAmount', `${row.amount ?? 0} ${row.currency ?? ''}`.trim()),
    createCopyLine('orderAmount', `${row.order_amount ?? 0} ${row.order_currency ?? row.currency ?? ''}`.trim()),
    createCopyLine('merchantName', row.merchant_name),
    createCopyLine('merchantCountry', row.merchant_country),
    createCopyLine('detail', row.detail),
  ]
  const content = lines.join('\n')

  copyText(
    content,
    t('card.index.bills.copySuccess'),
    t('card.index.bills.copyFailed'),
  )
}
