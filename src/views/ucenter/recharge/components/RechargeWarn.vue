<template>
  <div class="recharge-warn list-b-16" v-if="isShow">
    <div class="content list-b-16">
      <div class="title list-b-8">
          <h3>{{ $t('recharge.warning.title') }}</h3>
      </div>
      <div class="text list-b-12">
        <div class="tip list-b-8">
          <div class="tip-icon list-r-4">
            <Icon type="md-alert" size="18"/>
            <b>{{ $t('recharge.warning.reminder') }}</b>
          </div>
          <div class="tip-text list-b-4">
            <p>{{ $t('recharge.warning.minimum', { currency }) }}</p>
            <p>{{ $t('recharge.warning.verifyAddress') }}</p>
          </div>
        </div>
        <dl>
          <dt>{{ $t('recharge.warning.currency') }}</dt>
          <dd>{{ currency }}</dd>
        </dl>
        <dl>
          <dt>{{ $t('recharge.warning.network') }}</dt>
          <dd>{{ getName(chain,props.chainList,'chain','name') }}</dd>
        </dl>
      </div>
      <div class="button">
        <Button type="primary" size="default" @click="close">{{ $t('recharge.warning.confirm') }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed,reactive} from 'vue'
const props = defineProps({
  currency: {
    type: String,
  },
  chain: {
    type: String,
  },
  user: {
    type: Object,
  },
  chain: {
    type: String,
  },
  chainList: {
    type: Array,
    default: () => [],
  },
})
const isShow=ref(false)
const getName=(value,options,key='value',label='label')=>{
  return options.find(item=>item[key]===value)?.[label]
}
const open=()=>{
  isShow.value=true
}
const close=()=>{
  isShow.value=false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="less">
.recharge-warn{
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color:rgba(0, 0, 0, 0.5);
  z-index:9999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  padding: var(--ui-padding-8);
  .content{
    width: 100%;
    max-width: 460px;
    background: #fff;
    padding:var(--ui-padding-16);
    border-radius: var(--ui-radius-lg);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px 0;
    transition: transform 0.2s ease-in-out, opacity 0.3s ease-in-out;
    background: linear-gradient(180deg, #e0edff 0, #fff 20%, #fff);
    display: flex;
    flex-direction: column;
    .tip{
      text-align: left;
      color: var(--error-color);
      background: #ffefe6;
      padding:var(--ui-padding-6-8);
      border-radius: var(--ui-radius-sm);
      line-height: 18px;
      .tip-icon{
        display: flex;
        align-items: center;
      }
      .tip-text{
        flex: 1;
        font-size: 13px;
      }
    }
    .sub{
      color: var(--primary-color);
      margin: var(--ui-margin-0-4);
    }
    .title{
      text-align: center;
      h3{
        font-weight: bold;
      }
    }
    .text{
      text-align: left;
      font-size: 14px;
      border-top: 1px solid #f5f5f5;
      padding: 16px 0;
      border-bottom: 1px solid #f5f5f5;
      dl{
        display: flex;
        gap: 8px;
        dt{
          color: var(--ui-color-text-secondary);
          width: 70px;
        }
        dd{
          flex: 1;
        }
      }
    }
  }
  .button{
    display: flex;
    gap:8px;
    justify-content:center;
    align-items: center;
  }
}
</style>
