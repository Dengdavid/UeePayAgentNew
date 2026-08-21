import { systemConfig } from '../../system.config.js'

// 保留现有导出名称，调用方统一从根目录公共配置读取站点信息。
export const siteConfig = systemConfig.site
