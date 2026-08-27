import { ref } from 'vue'

// 判断是否为手机端模式
//页面宽度小于等于768px 为手机端
export const isPhone = ref(window.innerWidth <= 768)

export const updateIsPhone = () => {
  isPhone.value = window.innerWidth <= 768
}
