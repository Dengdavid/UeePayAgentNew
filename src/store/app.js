import { defineStore } from 'pinia'
import { publicApi } from '@/api/index.js'
import { siteConfig } from '@/config/site.js'

export const useAppStore = defineStore('appStore', {
  persist: {
    enabled: true,
    strategies: [
      {
        paths: []
      }
    ]
  },
  state: () => ({
    customerUrl: siteConfig.customerServiceUrl,
    notice: '',
    areaDatas: [],
    configDatas: {
      site_name: '',
      site_keyword: '',
      file_extensions: [],
      image_extensions: [],
      email_format: []
    }
  }),
  getters: {
    countries(state) {
      return state.areaDatas.map((item) => {
        return { label: item.label, value: item.value }
      })
    }
  },
  actions: {
    async init() {
      // 获取客服地址
      this.getCustomerUrl()
      // 获取公告内容
      this.getNotice()
      // 获取公告内容
      this.getConfig()
    },
    // 获取配置信息
    getConfig() {
      publicApi
        .getConfig()
        .then((res) => {
          this.configDatas = res || {}
        })
        .catch(() => {
          // err
        })
    },
    // 客服地址
    getCustomerUrl() {
      publicApi
        .getCustomerUrl()
        .then((res) => {
          if (res) {
            this.customerUrl = res
          }
        })
        .catch(() => {
          // err
        })
    },
    // 获取公告
    getNotice() {
      publicApi
        .notice()
        .then((res) => {
          this.notice = res || ''
        })
        .catch(() => {
          // err
        })
    },
    // 获取国家和地区数据
    getAreaDatas() {
      publicApi
        .getAreaDatas()
        .then((res) => {
          this.areaDatas = res || []
        })
        .catch(() => {
          // err
        })
    }
  }
})
