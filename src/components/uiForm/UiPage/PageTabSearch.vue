<template>
  <div class="tab-search">
    <UiFilterSelect v-for="item in data" :key="item.prop" v-bind="item" v-model="pageSearch[item.prop]" @on-change="$emit('search')">
      <template v-if="$slots.option" #option="{ row }">
        <slot name="option" :item="item" :row="row" />
      </template>
    </UiFilterSelect>
  </div>
</template>

<script setup>
import UiFilterSelect from '@/components/uiForm/UiFilterSelect/index.vue'

defineProps({
  data: { type: Array, default: () => [] },
  pageSearch: { type: Object, default: () => ({}) },
})
defineEmits(['search'])
</script>

<style lang="less" scoped>
.tab-search {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ui-space-12);
}
</style>
