<template>
    <div class="card-number">
        <CardLogo v-if="showType" :type="showType"></CardLogo>
        <div class="number">
            <slot>{{ showText }}</slot>
        </div>
        <template v-if="encrypt">
            <div v-if="loading" class="encrypt-btn td-btn">
                <Icon type="ios-loading" color="var(--ui-color-text-muted)" :size="16" class="loading-icon" />
            </div>
            <div v-else-if="show && copy" class="encrypt-btn td-btn show" @click="handleCopy">
                <Icon type="md-copy" color="var(--ui-color-text-muted)" :size="16" />
            </div>
            <div v-else class="encrypt-btn td-btn" :class="{show: show}" @click="handleSwitch">
                <Icon :custom="'iconfont icon-eye' + (show ? '' : '-close')" color="var(--ui-color-text-muted)"></Icon>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/store/card.js'
import { Copy } from 'view-ui-plus'
import CardLogo from '@/components/ui/card-logo.vue'

const props = defineProps({
    value: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    copy: {
        type: Boolean,
        default: false
    },
    encrypt: {
        type: Boolean,
        default: true
    },
    visible: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    controlled: {
        type: Boolean,
        default: false
    },
    bin: {
      type: [String, Number, Object],
      default: ''
    }
})

const cardStore = useCardStore()
const { binMaps } = storeToRefs(cardStore)

const emits = defineEmits(['on-change'])

const show = ref(!props.encrypt);

const showText = computed(() => {
    return props.value;
})

const showType = computed(() => {
    if(props.type) {
        return props.type;
    }
    
    // 如果bin是对象（包含network字段），直接使用
    if(props.bin && typeof props.bin === 'object' && props.bin.network) {
      return props.bin.network;
    }
    
    // 如果bin是字符串或数字，从binMaps查找
    if(props.bin) {
      const bin = typeof props.bin === 'object' ? props.bin.bin : props.bin;
      if(bin && binMaps.value[bin]) {
        return binMaps.value[bin]['network'] || '';
      }
    }

    //TODO 由于交易账单没有bin，所以暂时用卡号匹配
    if(props.value) {
      const binString = props.value.toString();
      const maxLength = Math.min(binString.length, 10);
      // 从6位开始，逐步增加到最大10位或BIN的实际长度，查找匹配的BIN
      for (let i = 6; i <= maxLength; i++) {
        const currentBin = binString.substring(0, i);
        if (binMaps.value[currentBin]) {
          return binMaps.value[currentBin]['network'] || '';
        }
      }
    }
    return '';
})

const handleCopy = function() {
    Copy({text: props.value});
}

const handleSwitch = function() {
    const nextShow = !show.value;
    if(!props.controlled) show.value = nextShow;
    emits('on-change', nextShow);
}

watch(() => props.visible, (newval) => {
    show.value = newval;
})
</script>

<style scoped>
.card-number {
    display: flex;
    align-items: center;
}
.card-number > div {
    flex-shrink: 0;
}
.card-number > div:first-child {
    margin-right: 10px;
}
.card-number .number {
    flex: 1;
}
.card-number .encrypt-btn {
    margin-left: 10px;
    cursor: pointer;
}
.loading-icon {
    animation: loading-rotate var(--ui-loading-spin-duration) var(--ui-ease-linear) infinite;
}
@keyframes loading-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
