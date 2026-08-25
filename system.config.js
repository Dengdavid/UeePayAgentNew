// 递归冻结配置对象，避免新增嵌套配置时遗漏只读保护。
const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

//https://staging.ueepay.com 沙箱环境
//https://ueepay.com 正式环境（UeePay）
//http://192.168.50.103:8787 超-本地环境
//http://192.168.50.133:8787 孔-本地环境
//http://192.168.50.150:8787 正-本地环境
//http://127.0.0.1:8787 本机环境

// 当前 API origin，不包含业务前缀 /api；手动切换环境时直接修改此处地址。
export const activeApiTarget = 'https://staging.ueepay.com'
//代理商站点地址
export const domainURL = 'www.yanghua.cc'
//
export const baseURL = '/agent'
//
export const tokenName = 'tokenAgent'
export const systemConfig = deepFreeze({
  site: {
    // 中文站点名称。
    nameZh: '优易付',
    // 英文站点名称。
    nameEn: 'UeePay',
    // 官网域名（不含协议）。
    website: 'www.ueepay.com',
    // 站点主域名。
    domain: 'ueepay.com',
    // 页脚展示的商务联系邮箱。
    businessEmail: 'root@ueepay.com',
    // 用户协议和隐私政策使用的隐私联系邮箱。
    privacyEmail: 'privacy@ueepay.com',
    // 在线客服默认地址；为空时等待服务端接口返回地址。
    customerServiceUrl: '',
    // 页脚展示的官网 Telegram 频道地址。
    officialChannelUrl: 'https://t.me/UeePayCom',
  },
})
