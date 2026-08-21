<template>
  <img v-if="imgUrl" :src="imgUrl" alt="Card Icon"/>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/store/card.js'
import iconVisa from '@/assets/images/icon_bank_visa.png'
import iconMaster from '@/assets/images/icon_bank_mastercard.png'
import iconDiscover from '@/assets/images/icon_bank_discover.png'

const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  bin: {
    type: [String, Number],
    default: ''
  }
})

const cardStore = useCardStore()
const { binMaps } = storeToRefs(cardStore)

const showType = computed(() => {
  if (props.type) return props.type;
  if (props.bin) {
    const binString = props.bin.toString();
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

const imgUrl = computed(() => {
  if (!showType.value) return '';
  const type = showType.value.toLowerCase();
  if (type === 'visa') {
    return iconVisa;
  }else if (type === 'mastercard') {
    return iconMaster;
  }else if (type === 'discover') {
    return iconDiscover;
  }
  return mastercard;
})
</script>

