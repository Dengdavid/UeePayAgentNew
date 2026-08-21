<template>
  <FormItem :prop="prop" :rules="c_rules">
    <template #label v-if="label">
      <div class="formTitle">
        <div class="title">
           <span>{{ label }}</span>
           <Tooltip v-if="tips" :max-width="600" placement="right">
             <span class="iconfont icon-question"></span>
             <template #content>
               <div class="tooltip-content">{{ tips }}</div>
             </template>
           </Tooltip>
        </div>
        <span class="sub" v-if="labelSub">{{labelSub}}</span>
      </div>
    </template>
    <slot/>
    <div class="desc" v-if="desc">
      <p>{{ desc }}</p>
    </div>
  </FormItem>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { t } from '@/utils/index.js';
  const props = defineProps({
    label: {
      type: String,
      default: ''
    },
    labelSub: {
      type: String,
      default: ''
    },
    prop: {
      type: String,
      default: 'id'
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    trigger: {
      type: [String,Array],
      default: 'change,blur'
    },
    rules: {
      type: [Object,Array],
    },
    tips:{
      type: String,
      default: ''
    },
    desc:{
      type: String,
      default: ''
    }
  });
  const isEmptyValue = (value) => {
    if (Array.isArray(value)) {
      return value.length === 0 || value.some((item) => item === null || item === undefined || String(item).trim() === '')
    }
    return value === null || value === undefined || value === '' || String(value).trim() === ''
  }
  const c_rules = computed(() => {
    const rulesArr=[{
      required: props.isRequired,
      type: 'any',
      validator: (rule, value, callback) => {
        if (props.isRequired && isEmptyValue(value)) {
          callback(new Error(t('validate.required', { field: props.label })))
        } else {
          callback()
        }
      },
      trigger: props.trigger,
    }]
    if(props.rules){
      if(Array.isArray(props.rules)){
          rulesArr.push(...props.rules)
      }else{
        const {max,min,isEmail}=props.rules
        if(max){
          rulesArr.push({
            max,
            message: t('validate.maxLength', { field: props.label, max }),
            trigger: 'change'
          })
        }
        if(min){
          rulesArr.push({
            min,
            message: t('validate.minLength', { field: props.label, min }),
            trigger: 'change'
          })
        }
        if(isEmail){
          rulesArr.push({
            type: 'email',
            message: t('validate.formatError', { field: props.label }),
            trigger: 'change'
          })
        }
      }
    }
    return rulesArr
  })
</script>
<style scoped lang="less">
.formTitle{
  display: inline-flex;
  align-items:baseline;
  gap: var(--ui-form-item-gap);
  >*{
    margin: 0;
  }
  .icon-question{
    color: var(--ui-form-helper-color);
    font-size: var(--ui-font-size-md);
  }
  .title{
    display: inline-flex;
    align-items: center;
    gap: var(--ui-form-item-gap);
  }
  .sub{
    font-size: var(--ui-form-helper-font-size);
    color: var(--ui-form-helper-color);
  }
}
.labelSub{
  color: var(--ui-form-helper-color);
}
.desc{
  color: var(--ui-form-helper-color);
  position: absolute;
  top: 100%;
  left: 0;
  line-height: 1;
  padding-top: var(--ui-space-6);
  font-size: var(--ui-form-helper-font-size);

}
.ivu-form-item-error{
  font-size: var(--ui-form-helper-font-size);
  .desc {
    display: none;
  }
}
.tooltip-content{
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  white-space: normal;
}
</style>
