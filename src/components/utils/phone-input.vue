<template>
    <div class="phone-input">
        <div class="select">
            <Dropdown trigger="click" placement="bottom-start" transfer-class-name="phone-dropwrap" @on-click="handleSelect" :disabled="disabled">
                <a href="javascript:void(0)" class="select-text" :class="{ 'disabled': disabled }">
                    <StateIcon :name="state.code || ''" size="small"></StateIcon>
                    <span class="code">+{{ phoneCode }}</span>
                    <Icon type="ios-arrow-down"></Icon>
                </a>
                <template #list>
                    <div class="search-box" @click.stop>
                        <Input v-model="searchQuery" size="default" clearable :placeholder="$t('phoneInput.searchPlaceholder')" />
                    </div>
                    <DropdownMenu class="phone-items">
                        <DropdownItem v-for="item in filteredCodes" :key="item.alpha3" :name="item.phoneCode" :selected="phoneCode === item.phoneCode">
                            <div class="state-cell">
                                <StateIcon :name="item.code" size="small"></StateIcon>
                                <span class="code ui-text-warning">+{{ item.phoneCode }}</span>
                                <span class="en">{{ item.alpha3 }}</span>
                                <span class="zh" :title="countryName(item)">{{ countryName(item) }}</span>
                            </div>
                        </DropdownItem>
                        <div v-if="filteredCodes.length === 0" class="nodata">{{ $t('phoneInput.empty') }}</div>
                    </DropdownMenu>
                </template>
            </Dropdown>
        </div>
        <div class="spacer"></div>
        <div class="input">
            <Input ref="phoneInputRef" :model-value="modelValue" type="tel" :placeholder="placeholder || $t('phoneInput.phonePlaceholder')" :autocomplete="autocomplete"
                data-1p-ignore="true" data-lpignore="true" data-bwignore="true" @input="handleInput" :disabled="disabled" />
        </div>
    </div>
</template>

<script setup>
import StateIcon from '@/components/ui/state-icon.vue'
import states from '@/config/countries.json'
import { t } from '@/utils'
import { computed, defineEmits, defineProps, nextTick, onMounted, ref } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    phoneCode: {
        type: [String, Number],
        default: '86'
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    autocomplete: {
        type: String,
        default: 'one-time-code'
    }
})

const codes = states.filter(item => item.phoneCode !== '')
const searchQuery = ref('')
const phoneInputRef = ref(null)

onMounted(() => nextTick(() => {
  const input = phoneInputRef.value?.$el?.querySelector('input')
  input?.setAttribute('data-bwignore', 'true')
  input?.setAttribute('data-1p-ignore', 'true')
  input?.setAttribute('data-lpignore', 'true')
}))

const state = computed(() => {
    return states.find(item => item.phoneCode === props.phoneCode) || {};
})

const countryName = item => t(item.name_key) || item.name

const filteredCodes = computed(() => {
  const uniqueCodes = Array.from(
    new Map(codes.map(item => [item.code, item])).values()
  );
  if (!searchQuery.value) {
    return uniqueCodes
  }
  const query = searchQuery.value.toLowerCase();
  return uniqueCodes.filter(item => {
    if (countryName(item).toLowerCase().indexOf(query) !== -1 || item.alpha3.toLowerCase().indexOf(query) !== -1) return true;
    if (item.name.indexOf(query) !== -1 || item.phoneCode.indexOf(query) !== -1) return true;
    return false;
  })
})

const emits = defineEmits(['update:modelValue', 'update:phoneCode', 'on-change'])

const handleSelect = function(name) {
    if (props.disabled) return;

    emits('update:phoneCode', name);
    emits('on-change', {
        phone: props.modelValue,
        code: name
    });
    searchQuery.value = '' // 清空搜索框
}

const handleInput = function(e) {
    if (props.disabled) return;

    emits('update:modelValue', e.target.value);
    emits('on-change', {
        phone: e.target.value,
        code: props.phoneCode
    });
}
</script>

<style lang="less">
.phone-input {
    position: relative;
    .select {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        z-index: 2;
        .select-text {
            display: flex;
            align-items: center;
            padding: 0 10px 0 15px;
            width: 110px;
            .code {
                flex: 1;
                padding-left: 5px;
                min-width: 1px;
            }
            &.disabled {
                cursor: not-allowed;
                color: var(--ui-color-control-text-disabled);
            }
        }
    }
    .spacer {
        position: absolute;
        top: 50%;
        left: 110px;
        transform: translateY(-50%);
        width: var(--ui-size-1);
        height: var(--ui-size-12);
        background: #D8D8D8;
        z-index: 2;
    }
    .input {
        position: relative;
        z-index: 1;
        input {
            padding-left: 120px;
        }
    }
}
.phone-dropwrap {
    width: min(var(--ui-size-360), calc(100vw - var(--ui-space-32)));
    padding: 0;
    max-height: none;
    .search-box {
        padding: var(--ui-padding-8);
        border-bottom: 1px solid #e8e8e8;
    }
    .phone-items {
      width: 100%;
      max-height: 180px;
      overflow: hidden;
      overflow-y: auto;
    }
    .state-cell {
        display: flex;
        align-items: center;
        color: #6e6e6e;
        .code {
            flex-shrink: 0;
            margin-left: 10px;
            width: var(--ui-size-60);
            font-weight: bold;
        }
        .en {
            flex-shrink: 0;
            width: var(--ui-size-44);
        }
        .zh {
            min-width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .nodata {
        text-align: center;
        color: var(--ui-color-neutral-550);
        padding: var(--ui-padding-12);
    }
}
</style>
