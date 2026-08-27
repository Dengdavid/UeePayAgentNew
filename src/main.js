import router, { setRouterUserStoreResolver } from '@/router/index.js'
import pinia from '@/store/index.js'
import { useUserStore } from '@/store/user.js'
import { vClickOutside } from '@/utils/clickOutside.js'
import ViewUIPlus from 'view-ui-plus'
import { createApp } from 'vue'
import App from './App.vue'
import '@/theme/default.less'
const app = createApp(App)
//公共组件
import * as FormComponents from '@/utils/components'
Object.entries(FormComponents).forEach(([name, component]) => {
  app.component(name, component);
});
// store
app.use(pinia)
setRouterUserStoreResolver(() => useUserStore(pinia))

// 初始化多语言
import i18n, { initializeLocaleMessages } from '@/locales/index.js'
import { isPhone } from '@/utils/device.js'
app.use(i18n)
// iviewui
app.use(ViewUIPlus, {
  size: 'default',
  transfer: true,
  i18n: (key) => i18n.global.t(key),
  select: {
    // arrow: 'md-arrow-dropdown',
    customArrow: 'iconfont icon-arrow-dropdown',
    arrowSize: 14
  },
  message: {
    duration: 8,      // 全局8秒
    closable: true    // 可手动关闭
  }
})
app.directive('click-outside', vClickOutside)
// 挂载
const mountApp = async () => {
  await initializeLocaleMessages()
  app.use(router)
  app.mount('#app')
}

mountApp()
