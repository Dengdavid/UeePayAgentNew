<template>
    <div class="card-logo">
        <BankTypeLogo :type="type" :bin="bin"></BankTypeLogo>
    </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import BankTypeLogo from '@/components/ui/bank-type-logo.vue'

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
</script>

<style scoped>
.card-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ui-padding-3);
    width: var(--ui-size-26);
    height: var(--ui-size-18);
    border-radius: var(--ui-radius-xs);
    border: 1px solid #EDEDED;
    background-color: var(--ui-color-surface);
}
.card-logo img {
    max-width: 100%;
    max-height: 100%;
}
</style>
