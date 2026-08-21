<template>
  <Tooltip placement="right" max-width="800" transfer>
    <Button type="text" size="default">查看</Button>
    <template #content>
      <pre >{{ data }}</pre>
    </template>
  </Tooltip>
</template>

<script setup>
import { Button } from 'view-ui-plus';
import { defineProps, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    default: null,
  },
})
</script>
<style lang="less" scoped>

</style>
