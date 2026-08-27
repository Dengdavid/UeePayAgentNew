import { ref, watch } from 'vue'
import { postApi } from '@/utils/api.js'

let pageRequestSequence = 0

/**
 * 管理 UiPage 的查询参数、状态筛选、分页、加载状态和请求竞态。
 */
export const usePageRequest = ({ props, isPhone, isCertificationBlocked, scrollToTop }) => {
  // 每个 UiPage 实例使用独立请求组，避免相同接口的多个页面实例相互取消。
  const takeLatestKey = `ui-page-${++pageRequestSequence}`
  const statusValue = ref(props.data?.status?.length ? props.data.status[0].value : 0)
  const loading = ref(false)
  const total = ref(0)
  const pageSearch = ref(props.data?.search || {})
  const pageData = ref({ page: 1, limit: 10 })
  const tbody = ref([])
  let currentRequestId = 0
  let activeRequestKey = ''
  let lastRequestKey = ''
  let lastRequestAt = 0
  let requestController = null
  const duplicateRequestWindow = 500

  const cancelActiveRequest = () => {
    if (!requestController) return
    requestController.abort()
    requestController = null
    activeRequestKey = ''
    lastRequestKey = ''
    lastRequestAt = 0
  }

  watch(pageSearch, cancelActiveRequest, { deep: true, flush: 'sync' })

  const getTbody = (searchData) => {
    const { apiUrl, dataKey = 'data' } = props.data || {}
    if (!apiUrl) return

    const requestKey = JSON.stringify({ apiUrl, searchData })
    const requestAt = Date.now()
    if (
      requestKey === activeRequestKey ||
      (requestKey === lastRequestKey && requestAt - lastRequestAt < duplicateRequestWindow)
    ) {
      return
    }

    cancelActiveRequest()
    const controller = new AbortController()
    requestController = controller
    const requestId = ++currentRequestId
    activeRequestKey = requestKey
    lastRequestKey = requestKey
    lastRequestAt = requestAt
    loading.value = true
    postApi(apiUrl, { ...searchData }, {
      signal: controller.signal,
      requestPolicy: {
        takeLatestKey,
      },
    })
      .then((response) => {
        if (requestId !== currentRequestId) return

        const responseData = response?.[dataKey] || response || []
        const data = typeof props.data?.dataProcessor === 'function'
          ? props.data.dataProcessor(responseData)
          : responseData
        total.value = response?.total || 0
        if (isPhone.value && Number(searchData?.page) > 1) {
          tbody.value.push(...data)
        } else {
          tbody.value = data
        }
      })
      .catch((error) => {
        if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return
        throw error
      })
      .finally(() => {
        if (requestId === currentRequestId) {
          requestController = null
          activeRequestKey = ''
          loading.value = false
        }
      })
  }

  const search = () => {
    if (isCertificationBlocked()) return

    const searchParams = {
      ...pageSearch.value,
      ...(props.data?.notPage ? {} : pageData.value),
    }
    const statusKey = props.data?.statusKey ?? (props.data?.status?.length ? 'status' : '')
    if (statusKey) searchParams[statusKey] = statusValue.value
    getTbody(searchParams)
  }

  const reset = () => {
    pageData.value.page = 1
    if (isPhone.value) {
      tbody.value = []
      scrollToTop('auto')
    }
    search()
  }

  const setStatus = (value) => {
    if (statusValue.value !== value) statusValue.value = value
    reset()
  }

  const handleChangePage = (page) => {
    pageData.value.page = page
    search()
  }

  const handleChangePageSize = (size) => {
    pageData.value.limit = size
    pageData.value.page = 1
    search()
  }

  const more = () => {
    if (loading.value) return
    pageData.value.page++
    search()
  }

  return {
    statusValue,
    loading,
    total,
    pageSearch,
    pageData,
    tbody,
    search,
    reset,
    setStatus,
    handleChangePage,
    handleChangePageSize,
    more,
    cancelActiveRequest,
  }
}
