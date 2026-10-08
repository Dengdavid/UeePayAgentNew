import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import * as common from '@zxcvbn-ts/language-common'
import * as english from '@zxcvbn-ts/language-en'

// 词典随本模块按需加载，评分只在浏览器本地执行。
export default new ZxcvbnFactory({
  graphs: common.adjacencyGraphs,
  dictionary: {
    ...common.dictionary,
    ...english.dictionary,
  },
  translations: english.translations,
})
