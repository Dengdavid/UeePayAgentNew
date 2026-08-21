<template>
   <div class="cardTag list-b-2"
    :class="{
      active: checked,
      thds: item['3ds'],
      disabled: isDisabled,
    }"
      @click="handleClick(item)">
      <Icon :type="checked ? 'ios-radio-button-on' : 'ios-radio-button-off'" class="radio-icon" v-if="!isNotSelect"/>
      <div class="cardTag-wrap">
        <div class="cardTag-title">
          <BankTypeLogo class="logo" :type="item.network" :bin="item.bin"></BankTypeLogo>
          <h3 class="title">{{item.name || item.bin }}</h3>
          <template v-if="item.physical">
            <span class="tag-label physical">{{ $t('cardTag.physicalCard') }}</span>
          </template>
           <span class="tag-label error" v-if="item.maintain">维护中</span>
        </div>
        <div class="cardTag-sub">
          <template v-for="(feat, index) in featureTags" :key="index">
            <Divider type="vertical" v-if="index>0"/>
            <span>{{ feat }}</span>
          </template>
          <Divider type="vertical" />
          <span>剩余开卡<span class="count">{{ item.allow_create_count<0?"∞":item.allow_create_count }}</span>张</span>
        </div>
      </div>
  </div>
</template>

<script setup>

import { authLevel,levelMap } from '@/utils/level.js'
import BankTypeLogo from '@/components/ui/bank-type-logo.vue'
import { toRoute } from '@/utils/route';
import { computed } from 'vue'
import { message,confirm,t } from '@/utils'
import { useAppStoreRefs,useUserStoreRefs } from '@/utils/store'
import { isPhone } from '@/utils/device.js'
import { Icon } from 'view-ui-plus'
const { customerUrl } = useAppStoreRefs()
const { user } = useUserStoreRefs()

// 提取并动态计算标签特性，使模板更干净
const featureTags = computed(() => {
  const tags = []
  if (props.item.country) tags.push(props.item.country)
  if (props.item['3ds']) tags.push('3DS')
  if (props.item.avs) tags.push('AVS')
  if (props.item.apple_pay) tags.push('Apple Pay')
  if (props.item.google_wallet) tags.push('Google Wallet')
  return tags
})

const props = defineProps({
	item: {
		type: Object,
		default: function() {
			return {}
		}
	},
	type: {
		type: String,
		default: ''
	},
	number: {
		type: [String, Number],
		default: ''
	},
	checked: {
		type: Boolean,
		default: false
	},
	isNotSelect: {
		type: Boolean,
		default: false
	}
})

const emits = defineEmits(['on-click'])
// 是否需要升级认证等级
const isNeedLevel=computed(()=>{
	// 企业用户不需要升级
	if(user.value.auth_type===1){
		return false
	}
	//如果是个人用户
	if(props.item.auth_level){
		return Number(props.item.auth_level)>Number(authLevel())
	}
	return false
})
//验证是否禁用
const isDisabled=computed(()=>{
	//未认证不能开卡
	if(user.value.auth_status==0){
		return true
	}else if(!props.item.allow_create){
		return true
	}else if(isNeedLevel.value && user.value.auth_type==0){
		return true
	}else if(props.item.allow_create_count==0){
		return true
	}else if(props.item.maintain){
		return true
	}
	return false
})
const handleClick = (row)=> {
	let confirmOption={
		text:'',
		okText: t('button.goAuth'),
		cancelText: t('cardTag.later')
	}
	if (user.value.auth_status===0) { // 禁用时不弹窗
		confirmOption.text = t('cardTag.authRequire')
	}else if(Object.hasOwn(row, 'allow_create') && !row?.allow_create){
		confirmOption.text = t('cardTag.currentBinNoPermission')
    confirmOption.isCustomer =true
		confirmOption.okText = t('button.contactService')
	}else if(isNeedLevel.value && user.value.auth_type==0 && row){ //判断是否需要升级认证等级
		confirmOption.text = t('cardTag.currentBinNoPermissionLevel', { level: levelMap?.value?.[row?.auth_level]?.label });
	}else if(row.allow_create_count===0){
		confirmOption.text = t('cardTag.binLimitReached')
    confirmOption.isCustomer =true
		confirmOption.okText = t('button.contactService')
	}else if(row.maintain){
		return
	}
	if(confirmOption.text){
		confirm(confirmOption.text,{
			okText:confirmOption.okText,
			cancelText:confirmOption.cancelText
		}).then(()=>{
			if(confirmOption.isCustomer){
				handlGoCustomer()
			}else{
        toRoute('certify')
			}
		})
	}else{
		emits('on-click');
	}
}
//联系客服
const handlGoCustomer = function () {
  if (customerUrl.value) {
    window.open(customerUrl.value, '_blank')
  }
}
</script>

<style scoped lang="less">
.cardTag {
  position: relative;
  border: var(--ui-card-tag-border);
  padding:var(--ui-padding-8-12);
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--ui-card-tag-radius);
  cursor: pointer;
  background: var(--ui-card-tag-background);
  transition: all var(--ui-motion-normal) var(--ui-ease-soft);
  .cardTag-wrap{
    flex: 1;
  }
  .radio-icon {
    font-size: 18px;
    color: var(--ui-color-neutral-400);
    transition: color var(--ui-motion-control) var(--ui-ease-soft);
  }
  &:hover {
    border-color: var(--ui-color-primary);
    box-shadow: var(--ui-card-tag-shadow-hover);
  }

  &.active {
    color: var(--ui-color-primary);
    border-color: var(--ui-color-primary);
    background: var(--ui-card-tag-active-background);
    box-shadow: var(--ui-card-tag-shadow-active);
    .radio-icon {
      color: var(--ui-color-primary);
    }
  }

  &.disabled {
    background: var(--ui-card-tag-disabled-background);
    color: var(--ui-color-neutral-550);
    border-color: var(--ui-card-tag-disabled-border-color);
    cursor: not-allowed;
    opacity: var(--ui-card-tag-disabled-opacity);
    &:hover {
      transform: none;
      box-shadow: none;
    }
    .logo {
      filter: grayscale(100%);
      opacity: var(--ui-opacity-control-disabled);
    }
  }

  .cardTag-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom:3px;
    .title {
      font-size: 15px;
      font-weight: 600;
    }
    .logo {
      max-height:10px;
      opacity: 0.85;
    }
    .tag-label{
      border: none;
      padding: var(--ui-padding-2-8);
      border-radius: var(--ui-radius-full);
      font-size: 10px;
      font-weight: 600;
      line-height: 1.2;
      color: var(--ui-color-text-inverse);
      &.physical {
        background: var(--ui-gradient-warning);
        box-shadow: var(--ui-shadow-warning-soft);
      }
      &.error {
        background: var(--ui-gradient-error);
        box-shadow: var(--ui-shadow-error-soft);
      }
    }
  }

  .cardTag-sub {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--ui-color-text-subtle);
    line-height: 1.4;

    > * {
      margin: 0 !important;
    }

    .ivu-divider {
      background: #e8eaec !important;
      position: relative;
      top: 0;
    }

    .count {
      color: var(--ui-color-warning);
      margin: var(--ui-margin-0-3);
    }
  }
}
</style>
