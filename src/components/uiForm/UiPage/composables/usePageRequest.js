import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import request from '@/api/request.js'
import { postApi } from '@/utils/api.js'
import { showRequestError } from '@/utils/message.js'

let pageRequestSequence = 0

/**
 * 管理 UiPage 的查询参数、状态筛选、分页、加载状态和请求竞态。
 */
export const usePageRequest = ({ props, isPhone, isCertificationBlocked, scrollToTop, scrollBody, sharedSearch }) => {
  const route = useRoute()
  const routeName = route.name
  const saved = props.returnState?.search ? JSON.parse(JSON.stringify(props.returnState)) : null
  let alive = true
  // 每个 UiPage 实例使用独立请求组，避免相同接口的多个页面实例相互取消。
  const takeLatestKey = `ui-page-${++pageRequestSequence}`
  const statusValue = ref(saved && props.data?.status?.some(item => item.value === saved.status) ? saved.status : (props.data?.status?.length ? props.data.status[0].value : 0))
  const loading = ref(false)
  const total = ref(0)
  const pageSearch = ref(props.data?.search || {})
  const initialSearch = { ...(props.data?.search || {}) }
  if (saved) {
    Object.keys(pageSearch.value).forEach(key => delete pageSearch.value[key])
    Object.assign(pageSearch.value, saved.search)
  }
  const pageData = ref(saved?.pagination || { page: 1, limit: 10 })
  const tbody = ref([])
  let currentRequestId = 0
  let activeRequestKey = ''
  let lastRequestKey = ''
  let lastRequestAt = 0
  let requestController = null
  const duplicateRequestWindow = 500

  const cancelActiveRequest = () => {
    requestController?.abort()
    requestController = null
    activeRequestKey = ''
    lastRequestKey = ''
    lastRequestAt = 0
  }

  watch(pageSearch, cancelActiveRequest, { deep: true, flush: 'sync' })

  const getTbody = (searchData) => {
    const { apiUrl, dataKey = 'data' } = props.data || {}
    if (!apiUrl) return

    const requestMethod = String(props.data?.method || 'post').toLowerCase() === 'get'
      ? 'get'
      : 'post'
    const requestKey = JSON.stringify({ apiUrl, requestMethod, searchData })
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
    const requestConfig = {
      signal: controller.signal,
      requestPolicy: {
        takeLatestKey,
      },
    }
    const requestPromise = requestMethod === 'get'
      ? request({
          ...requestConfig,
          url: apiUrl,
          method: 'get',
          params: { ...searchData },
        })
      : postApi(apiUrl, { ...searchData }, requestConfig)

    return requestPromise
      .then((response) => {
        if (!alive || requestId !== currentRequestId) return

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
        return requestId
      })
      .catch((error) => {
        if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return
        if (alive && requestId === currentRequestId) showRequestError(error)
      })
      .finally(() => {
        if (requestId === currentRequestId) {
          requestController = null
          activeRequestKey = ''
          loading.value = false
        }
      })
  }

  const getSearchParams = () => {
    const searchParams = { ...pageSearch.value }
    const statusKey = props.data?.statusKey ?? (props.data?.status?.length ? 'status' : '')
    if (statusKey) searchParams[statusKey] = statusValue.value
    return { ...searchParams, ...sharedSearch?.value }
  }

  const search = () => {
    if (isCertificationBlocked()) return

    return getTbody({
      ...getSearchParams(),
      ...(props.data?.notPage ? {} : pageData.value),
    })
  }

  const save = () => {
    if (!props.returnState || !props.data?.apiUrl) return
    const search = JSON.parse(JSON.stringify(pageSearch.value))
    const statusKey = props.data?.statusKey ?? (props.data?.status?.length ? 'status' : '')
    if (statusKey) search[statusKey] = statusValue.value
    // 完整卡号搜索值不跨页面保留，其他筛选仅存于当前流程内存。
    for (const key of ['card_no', 'cardNo']) {
      if (String(search[key] || '').replace(/\D/g, '').length >= 12) delete search[key]
    }
    Object.assign(props.returnState, {
      search,
      status: statusValue.value,
      pagination: { ...pageData.value },
      scrollTop: scrollBody?.value?.scrollTop || 0,
      windowTop: window.scrollY,
    })
  }
  if (props.returnState) onBeforeRouteLeave(save)
  onBeforeUnmount(() => {
    if (route.name === routeName) save()
    alive = false
  })

  const restore = async () => {
    const targetPage = pageData.value.page
    if (isPhone.value && saved) pageData.value.page = 1
    let requestId = await search()
    if (!alive || !requestId || requestId !== currentRequestId) return
    if (isPhone.value && saved) {
      while (pageData.value.page < targetPage && tbody.value.length < total.value) {
        pageData.value.page++
        requestId = await search()
        if (!alive || !requestId || requestId !== currentRequestId) return
      }
    } else if (saved && !props.data?.notPage) {
      const lastPage = Math.max(1, Math.ceil(total.value / pageData.value.limit))
      if (pageData.value.page > lastPage) {
        pageData.value.page = lastPage
        requestId = await search()
      }
    }
    await nextTick()
    if (!alive || !saved || !requestId || requestId !== currentRequestId) return
    scrollBody?.value?.scrollTo({ top: saved.scrollTop, behavior: 'auto' })
    window.scrollTo({ top: saved.windowTop, behavior: 'auto' })
  }

  const reset = () => {
    pageData.value.page = 1
    if (isPhone.value) {
      tbody.value = []
      scrollToTop('auto')
    }
    search()
  }

  const resetSearch = async () => {
    for (const item of props.data?.searchThead || []) {
      if (item.type === 'daterange' || item.type === 'monthrange') {
        const startKey = item.startKey || 'startTime'
        const endKey = item.endKey || 'endTime'
        const shouldRestoreDefaultRange = item.type === 'daterange'
          && Number(item.maxMonths) > 0
          && initialSearch[startKey]
          && initialSearch[endKey]

        if (shouldRestoreDefaultRange) {
          pageSearch.value[startKey] = initialSearch[startKey]
          pageSearch.value[endKey] = initialSearch[endKey]
        } else {
          delete pageSearch.value[startKey]
          delete pageSearch.value[endKey]
        }
        continue
      }

      if (item.prop) delete pageSearch.value[item.prop]
    }

    const statusKey = props.data?.statusKey ?? (props.data?.status?.length ? 'status' : '')
    if (statusKey) pageSearch.value[statusKey] = statusValue.value
    await nextTick()
    cancelActiveRequest()
    reset()
  }

  if (sharedSearch) watch(sharedSearch, (value, oldValue) => {
    if (!props.data?.apiUrl || JSON.stringify(value) === JSON.stringify(oldValue)) return
    cancelActiveRequest()
    reset()
  }, { deep: true })

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
    resetSearch,
    setStatus,
    handleChangePage,
    handleChangePageSize,
    more,
    cancelActiveRequest,
    restore,
    getSearchParams,
  }
}
