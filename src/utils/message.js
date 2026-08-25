import { Message,Modal,Input } from 'view-ui-plus'
import { createApp, h, nextTick, ref } from 'vue';
import { t } from '@/utils'
/**
 * 封装 Message
 * @param {string|Object} text - 提示文字或错误对象
 * @param {string} type - 类型 (success, error, warning, info)
 * @param {number} duration - 时长 (可选)
 */
export const message = (text, type = 'success',confing={}) => {
  const content = text && typeof text === 'object'
    ? text.msg || text.message || text
    : text;
  if (text?.silent || content === 'SILENT_ERROR' || !content) return;
  Message[type]({
    content:content,
    duration:type==='success' ? 3:10,
    closable:type==='success' ? false : true,
    ...confing
  });
};

//确认弹窗
export const confirm=(text,options={})=>{
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: options?.title || t('message.promptTitle'),
      content: text,
      okText:options?.okText || t('button.confirm'),
      cancelText:options?.cancelText || t('button.cancel'),
      onOk: () => {
        resolve(true)
      },
      onCancel: () => {
        if (options?.resolveCancel) {
          resolve(false)
        }
      }
    })
    nextTick(() => {
      const confirmModals = document.querySelectorAll('.ivu-modal-confirm');
      const currentModal = confirmModals[confirmModals.length - 1];
      currentModal?.closest('.ivu-modal-wrap')?.classList.add('vertical-center-modal');
    })
  })
}

//文本确认弹窗
export const confirmInput = (title, modelValue = '', options = {}) => {
  return new Promise((resolve, reject) => {
    // 动态创建一个挂载点
    const div = document.createElement('div');
    document.body.appendChild(div);
    // 定义响应式状态
    const visible = ref(true);
    const val = ref(modelValue);
    const loading = ref(true); // 始终保持 loading 模式，接管关闭逻辑
    const close=()=>{
      visible.value = false; // 验证通过，手动关闭弹窗
      loading.value = false;
    }
    const app = createApp({
      render() {
        return h(Modal, {
          modelValue: visible.value,
          'onUpdate:modelValue': (v) => { visible.value = v; },
          title: options?.title || t('button.editField', { field: title }),
          width:400,
          className: 'vertical-center-modal',
          loading: loading.value,
          okText: options?.okText || t('button.confirm'),
          cancelText: options?.cancelText || t('button.cancel'),
          onOnOk: () => {
            const normalizedValue = String(val.value ?? '').trim();
            const isValid = normalizedValue === ''
              ? options?.allowEmpty === true
              : options?.pattern
                ? options.pattern.test(normalizedValue)
                : true;
            if (!isValid) {
              message(options?.msg || t('placeholder.inputPlaceholder'), 'error');
              // 验证失败：取消 loading 状态，让用户可以再次点击确定
              loading.value = false;
              // 必须在下一个 tick 恢复 loading=true，否则下次点击确定弹窗会直接关闭
              setTimeout(() => { loading.value = true; }, 0);
            } else {
              if(val.value !== modelValue){
                resolve({
                  value: normalizedValue,
                  close: close
                });
              }else{
                close()
              }
            }
          },
          onOnCancel: () => {
            visible.value = false;
          },
          onOnHidden: () => {
            // 动画结束后，卸载应用并移除 DOM 节点
            app.unmount();
            div.remove();
          }
        }, () => [
          h(Input, {
            size: "large",
            modelValue: val.value,
            'onUpdate:modelValue': (v) => { val.value = v; },
            autofocus: true,
            placeholder: options?.placeholder || t('placeholder.inputPlaceholder')
          })
        ]);
      }
    });

    // 挂载组件
    app.mount(div);
  });
}

export const messageLoading=(text='',options={})=>{
  const loadingInstance = Message.loading({
    content:text,
    duration:0,
    ...options
  })
  return loadingInstance
}
