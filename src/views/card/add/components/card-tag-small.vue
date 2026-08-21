<template>
<div class="card-tag"
  :class="{
    checked: checked,
    thds: item['3ds'],
    disabled: isDisabled,
  }"
  @click="handleClick(item)">
    <div class="number">{{item.name || item.bin }}</div>
    <div class="auto">
      <div v-if="item.physical" class="physical-label">{{ $t('cardTag.physicalCard') }}</div>
      <span class="tag-label error" v-if="item.maintain">{{ $t('cardTag.maintenance') }}</span>
    </div>
    <BankTypeLogo class="logo" :type="item.network" :bin="item.bin"></BankTypeLogo>
</div>

</template>

<script setup>

import { authLevel,levelMap } from '@/utils/level.js'
import BankTypeLogo from '@/components/ui/bank-type-logo.vue'
import { toRoute } from '@/utils/route';
import { computed } from 'vue'
import { confirm,t } from '@/utils'
import { useAppStoreRefs,useUserStoreRefs } from '@/utils/store'
const { customerUrl } = useAppStoreRefs()
const { user } = useUserStoreRefs()
const props = defineProps({
	item: {
		type: Object,
		default: function() {
			return {}
		}
	},
	checked: {
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
.card-tag {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: var(--ui-padding-10);
	height:var(--ui-size-38);
	gap: 4px;
	border-radius: var(--ui-radius-3);
	border: var(--ui-card-tag-border);
	background-color: var(--ui-card-tag-compact-background);
	user-select: none;
	cursor: pointer;
	overflow: hidden;
}

.card-tag.thds {
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAYAAACaq43EAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRGNTQ0MERBQkY3QTExRUY5MUIwOEVFODBCN0U5RUQzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjRGNTQ0MERCQkY3QTExRUY5MUIwOEVFODBCN0U5RUQzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NEY1NDQwRDhCRjdBMTFFRjkxQjA4RUU4MEI3RTlFRDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NEY1NDQwRDlCRjdBMTFFRjkxQjA4RUU4MEI3RTlFRDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz42zr3rAAABb0lEQVR42rRW0WrDMAy0vUJgg0GggUIeBnkr7Av3AfvCQaGFQR8CgQUCfSgY0mWncR5hxKmduoLDIGOdJMuH1TAMagqx9v2eZVN+X3yjEhhIX7C8Ys1Dz5gEpCUWITyaN9uFnlslKPgZOAEdktgwiR6okcj5nsQ9yVybhewJqICPu7Ua9gm0QAPsUOUO6xeQoQMPvkPaN8Fa67l7lfZKUPu/nRwwGbYOe0dv/FhiTvB65GqFgHsVW/7n88U3C57N7wQTUu2afkXfwZHOWXDFfDYytQ0C1/RJu7dynzJI8NspAbm14oYVbvhsFIgucpfcf4zpnrkmDsBWWkmSPclLR85qbYx4zBKztQXfqdxjPkHuhqmOfYNzFReUwQOJciajRuQ5FapLSbyXgJxYaeeFyVSjyiWxZonqeCVzJAyWSZyRRE9yN1jtUrm7qtWuIqpVQTm82VaBwiETXFKR6hTEKvQHwoqTxddLvjkp7EeAAQBsL/NGOcUx7QAAAABJRU5ErkJggg==');
}

.card-tag .number {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.card-tag .auto{
  flex: 1;
	min-width: 1px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.card-tag .logo {
	flex-shrink: 0;
	max-width: 36px;
	max-height: 14px;
	opacity: var(--ui-opacity-faint);
}

.card-tag.checked {
	color: var(--primary-color);
	border-color: var(--primary-color);
	background-color: var(--ui-card-tag-compact-active-background);
}

.card-tag.checked .logo {
	opacity: var(--ui-opacity-visible);
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

.card-tag.disabled {
	background-color: var(--ui-card-tag-compact-disabled-background);
	color: var(--ui-color-neutral-600);
	border-color: var(--ui-card-tag-compact-disabled-border-color);
	cursor: not-allowed;
	pointer-events: auto;
}
.card-tag.disabled .logo {
	opacity: 0.1;
}

.tooltip {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #333;
	color: var(--ui-color-text-inverse);
	padding: var(--ui-padding-5-10);
	border-radius: var(--ui-radius-md);
	white-space: nowrap;
	z-index: var(--ui-layer-tooltip);
	opacity: var(--ui-opacity-hidden);
	transition: opacity var(--ui-motion-slow) var(--ui-ease-soft);
}

.tooltip-arrow {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 0;
	height: 0;
	border-style: solid;
	border-width: 5px;
	border-color: #333 transparent transparent transparent;
}

.card-tag:hover .tooltip {
	opacity: var(--ui-opacity-visible);
}
</style>
