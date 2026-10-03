import { defineStore } from 'pinia'
import { publicApi } from '@/api/index.js'
import { siteConfig } from '@/config/site.js'
import router from '@/router/index.js'

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
    configUnavailable: false,
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
      // 获取代理商公告
      // this.getNotice()
      // 获取配置信息
      await this.getConfig()
    },
    // 获取配置信息
    async getConfig() {
      await publicApi
        .getConfig()
        .then((res) => {
          this.configUnavailable = res === ''
          this.configDatas = res || {}
          if (!res) {
            return router.replace({ name: 'error_403' })
          }
          this.customerUrl=res.customer_link
        })
        .catch((err) => {
          if (err?.data === '' && ![-100, 410, 429, 451].includes(err?.code)) {
            this.configUnavailable = true
            this.configDatas = {}
            return router.replace({ name: 'error_403' })
          }
        })
    },
    // 获取代理商公告
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
