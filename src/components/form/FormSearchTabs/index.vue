<template>
    <div class="headerSearch-tabs">
        <div class="headerSearch-tabs-item" 
        :class="{active: (modelValue === '' || modelValue === null || modelValue === undefined)}" 
        @click="handleTag(allLabel)">
            {{ allLabel }}
        </div>
        <div class="headerSearch-tabs-item" 
            :class="{active:modelValue == key}" 
            v-for="(item,key) in options" 
            :key="key" 
            @click="handleTag(key)">
            {{ item }}
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    options: {
        type: Object,
        required: true,
        default: () => ({})
    },
    allLabel: {
        type: String,
        default: '全部'
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleTag = (key) => {
    const val = key === props.allLabel ? null : key;
    emit('update:modelValue', val);
    emit('change', val);
}
</script>

<style lang="less" scoped>
.headerSearch-tabs{
    display: flex;
    flex-wrap: wrap;
    background: #F5F7FA;
    padding:var(--ui-padding-6);
    border-radius: var(--ui-radius-sm);
    gap:6px;
    .headerSearch-tabs-item{
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    padding: var(--ui-padding-4-16);
    border-radius: var(--ui-radius-sm);
    &:hover{
        color: var(--primary-color);
        background: var(--ui-color-surface);
    }
    &.active{
        background: var(--primary-color);
        color: var(--ui-color-text-inverse);
    }
    }
}
</style>
