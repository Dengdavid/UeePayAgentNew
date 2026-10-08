<template>
  <div class="ui-page-status-btn list-r-8" v-if="data?.length>0">
    <template v-if="isPhone">
        <Dropdown placement="bottom-end" trigger="click">
          <Button size="small" shape="circle" :loading="data.some(item => item.loading)">
              <span>{{ $t('button.operation') }}</span>
              <Icon type="ios-arrow-down"></Icon>
          </Button>
          <template #list>
              <DropdownMenu>
                <template v-for="item in data" :key="item.label" >
                  <DropdownItem :disabled="Boolean(item.loading) || item.disabled === true" @click.stop="!item.loading && item.disabled !== true && item.click()" v-if="typeof item.hidden==='function'?item.hidden?.(statusValue):true">{{ item.label }}</DropdownItem>
                </template>
              </DropdownMenu>
          </template>
      </Dropdown>
    </template>
    <template v-else>
      <template v-for="item in data" :key="item.label" >
        <template v-if="typeof item.hidden==='function'?item.hidden?.(statusValue):true">
          <Tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" transfer>
            <span class="action-tooltip-trigger" tabindex="0" :aria-label="item.tooltip">
              <Button :type="item?.type || 'default'" :class="item.class" :loading="item.loading" :disabled="Boolean(item.loading) || item.disabled === true" :icon="item.icon" @click.stop="!item.loading && item.disabled !== true && item.click()">{{ item.label }}</Button>
            </span>
          </Tooltip>
          <Button v-else :type="item?.type || 'default'" :class="item.class" :loading="item.loading" :disabled="Boolean(item.loading) || item.disabled === true" :icon="item.icon" @click.stop="!item.loading && item.disabled !== true && item.click()">{{ item.label }}</Button>
        </template>
      </template>
    </template>
  </div>
</template>
<script setup>
import { isPhone } from '@/utils/device.js'
const props = defineProps({
  data:{
    type: Array,
  },
  statusValue:{}
})
</script>
<style lang="less" scoped>
.action-tooltip-trigger {
  display: inline-flex;
  cursor: not-allowed;

  :deep(button:disabled) { pointer-events: none; }
}

.card-action-btn {
  width: auto;
  min-width: 110px !important;
  height: var(--ui-size-36);
  padding: var(--ui-padding-0-16);
  border: 0;
  font-size: 13px;
  box-shadow: none;
  white-space: nowrap;

  &:hover,
  &:focus,
  &:active {
    border: 0;
    box-shadow: none;
  }
}

.physical-btn {
  background: var(--ui-gradient-warning-wide);

  &:hover,
  &:focus {
    color: var(--ui-color-text-inverse);
    opacity: 0.88;
  }
}

.shared-wallet-btn {
  background: var(--ui-gradient-purple-blue);

  &:hover,
  &:focus {
    color: var(--ui-color-text-inverse);
    opacity: 0.88;
  }
}

@media screen and (max-width: 768px) {
  .card-action-btn {
    width: 100%;
    min-width: 100% !important;
    height: var(--ui-size-44);
  }
}
</style>
