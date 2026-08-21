<template>
  <div class="ui-page-status-btn list-r-8" v-if="data?.length>0">
    <template v-if="isPhone">
        <Dropdown placement="bottom-end" trigger="click">
          <Button size="small" shape="circle">
              <span>操作</span>
              <Icon type="ios-arrow-down"></Icon>
          </Button>
          <template #list>
              <DropdownMenu>
                <template v-for="item in data" :key="item.label" >
                  <DropdownItem @click.stop="item.click()" v-if="typeof item.hidden==='function'?item.hidden?.(statusValue):true">{{ item.label }}</DropdownItem>
                </template>
              </DropdownMenu>
          </template>
      </Dropdown>
    </template>
    <template v-else>
      <template v-for="item in data" :key="item.label" >
        <Button :type="item?.type || 'default'" :loading="item.loading" :icon="item.icon" @click.stop="item.click()" v-if="typeof item.hidden==='function'?item.hidden?.(statusValue):true">{{ item.label }}</Button>
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

</style>
