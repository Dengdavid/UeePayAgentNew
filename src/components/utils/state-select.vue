<template>
    <div v-if="props.disabled" class="state-select-trigger">
        <StateIcon :name="currentState.country_code || ''" :size="size"></StateIcon>
        <div class="name">{{ currentState.payout_currency || '请选择' }}</div>
    </div>
    <Dropdown
        v-else
        placement="bottom-end"
        transfer-class-name="state-dropwrap"
        trigger="custom"
        :visible="dropdownVisible"
        @on-click="handleSelect"
        @on-clickoutside="handleClickOutside"
    >
        <div
            class="state-select-trigger"
            role="button"
            tabindex="0"
            aria-haspopup="listbox"
            :aria-expanded="dropdownVisible"
            @click="toggleDropdown"
            @keydown.enter.prevent="toggleDropdown"
            @keydown.space.prevent="toggleDropdown"
        >
            <StateIcon :name="currentState.country_code || ''" :size="size"></StateIcon>
            <div class="name">{{ currentState.payout_currency || '请选择' }}</div>
            <Icon type="ios-arrow-down" color="#A1A1A1" />
        </div>
        <template #list>
            <div class="head" @click.stop>
                <Input
                    v-model="keyword"
                    placeholder="搜索国家/币种"
                    size="default"
                    clearable
                    @on-focus="handleFocus"
                    @on-blur="handleBlur"
                    @compositionstart.native="handleCompositionStart"
                    @compositionend.native="handleCompositionEnd"
                />
            </div>
            <div class="state-wrap">
              <DropdownMenu>
                  <DropdownItem
                      v-for="item in renderStates"
                      :key="item.country"
                      :name="item.country"
                      :selected="modelValue === item.country"
                  >
                      <div class="state-cell">
                          <StateIcon :name="item.country_code" :size="size"></StateIcon>
                          <span class="currency">{{ item.payout_currency }}</span>
                          <span class="zh">{{ item.country_name }}</span>
                      </div>
                  </DropdownItem>
                  <div v-if="renderStates.length === 0" class="nodata">暂无可选币种</div>
              </DropdownMenu>
            </div>
        </template>
    </Dropdown>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import StateIcon from '@/components/ui/state-icon.vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'small'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default: () => []
    }
})

// 添加 watch 来监控数据变化
watch(() => props.options, (newVal) => {
}, { immediate: true });

watch(() => props.modelValue, (newVal) => {
}, { immediate: true });

const emits = defineEmits(['update:modelValue', 'on-change'])

const keyword = ref('')
const isInputFocused = ref(false)
const isComposing = ref(false) // 追踪中文输入法组合状态
const dropdownVisible = ref(false) // 手动控制下拉框显示

// 切换下拉框显示
const toggleDropdown = () => {
    dropdownVisible.value = !dropdownVisible.value
    if (!dropdownVisible.value) {
        keyword.value = '' // 关闭时清空搜索
    }
}

// 处理点击外部关闭（但排除输入框中文输入期间的误关闭）
const handleClickOutside = () => {
    // 不在中文输入组合期间才关闭
    if (!isComposing.value) {
        dropdownVisible.value = false
        keyword.value = ''
    }
}

// 处理输入框焦点
const handleFocus = () => {
    isInputFocused.value = true
}

// 处理输入框失焦
const handleBlur = () => {
    isInputFocused.value = false
}

// 处理中文输入法组合开始
const handleCompositionStart = () => {
    isComposing.value = true
}

// 处理中文输入法组合结束
const handleCompositionEnd = () => {
    isComposing.value = false
}

// 当前选中的状态
const currentState = computed(() => {
    const options = JSON.parse(JSON.stringify(props.options));
    const found = options.find(item => item.country === props.modelValue);
    return found || options[0] || {}; // 如果没找到，返回第一个选项
})

const renderStates = computed(() => {
    // 在中文输入法组合期间，不进行过滤，保持显示全部选项
    if(!keyword.value || isComposing.value) return props.options;
    const key = keyword.value.toLowerCase();
    return props.options.filter(item => {
        // 搜索 country_name（中文名）
        if(item.country_name.toLowerCase().indexOf(key) !== -1) return true;
        // 搜索 country（国家代码）
        if(item.country.toLowerCase().indexOf(key) !== -1) return true;
        // 搜索 country_code（国旗代码）
        if(item.country_code.toLowerCase().indexOf(key) !== -1) return true;
        // 搜索 payout_currency（币种）
        if(item.payout_currency.toLowerCase().indexOf(key) !== -1) return true;
        return false;
    })
})

const handleSelect = function(value) {
    // 如果输入框正在输入，不处理选择事件
    if (isInputFocused.value) return;
    const row = props.options.find(item => item.country === value) || {};
    emits('update:modelValue', value);
    emits('on-change', row);
    // 选择后关闭下拉框
    dropdownVisible.value = false;
    keyword.value = '';
}
</script>

<style lang="less">
.state-select-trigger {
    display: flex;
    align-items: center;
    outline: 0;
    cursor: pointer;
    .name {
        margin: var(--ui-margin-0-4);
        color: var(--ui-color-text);
        font-size: 14px;
        font-weight: 500;
    }
}

.state-dropwrap {
    padding: 0;
    max-height: none;
    min-width: 240px !important;
    .head {
        padding: var(--ui-padding-8);
    }
    .state-wrap {
        height: 220px;
        border-top: 1px solid #f1f1f1;
        overflow: hidden;
        overflow-y: auto;
        .ivu-dropdown-item {
            padding: 0;
        }
        .state-cell {
            display: flex;
            align-items: center;
            padding: var(--ui-padding-8-12);
            cursor: pointer;
            .currency {
                flex-shrink: 0;
                min-width: 48px;
                margin: var(--ui-margin-0-8);
                font-size: 14px;
                font-weight: 500;
                color: var(--ui-color-text);
            }
            .zh {
                color: var(--ui-color-text-subtle);
                flex: 1;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .item.active, .item:hover {
            background-color: #EAEFFF;
        }
    }
    .nodata {
        text-align: center;
        color: var(--ui-color-neutral-550);
        padding: var(--ui-padding-12);
        border-top: 1px solid #f1f1f1;
    }
}
</style>
