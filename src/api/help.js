import { get, post } from './api.js'

export default {
  // 获取所有帮助分类
  async helpCate(data) {
    return await get('/help/cate', data)
  },
  // 获取帮助文章列表
  async helpList(data) {
    return await get('/help/list', data)
  },
  // 获取帮助文章详情
  async helpDetail(data) {
    return await get('/help/detail', data)
  },
  // 点击是否有帮助
  async userHelpResolved(data) {
    return await post('/user/helpResolved', data)
  },
}
