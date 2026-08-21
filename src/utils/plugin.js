// composables/index.js (或 libs/helper.js)
import { onClickOutside } from '@vueuse/core'
import { Message, Modal } from 'view-ui-plus'
import { debounce } from '@/libs/tools.js'
import { highlightText, escapeHtml } from '@/utils/text.js'
import CellBox from '@/components/ui/cell-box.vue'
import FellBox from '@/components/ui/fell-box.vue'
import TabsBox from '@/components/ui/tabs-box.vue'
import TreeBox from '@/components/ui/tree-box.vue'
import TableBox from '@/components/ui/table-box.vue'
import EmptyBox from '@/components/ui/empty-box.vue'
import LoadingBox from '@/components/ui/loading-box.vue'
import ImgBox from '@/components/ui/img-box.vue'
import { setSize } from '@/utils/unitConversion.js'
// 仅导出真正需要封装的内容
export {
  // 工具函数
  //防抖
  debounce,
  //点击ref之外后执行方法
  onClickOutside,
  //文本高亮
  highlightText,
  escapeHtml,
  // UI 组件（按需）
  CellBox,
  FellBox,
  TabsBox,
  TreeBox,
  TableBox,
  EmptyBox,
  LoadingBox,
  ImgBox,
  //
  setSize,
  // UI 库方法（谨慎）
  Message,
  Modal,
}
