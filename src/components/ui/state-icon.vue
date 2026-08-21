<template>
    <div class="ui-state-icon" :class="{'ui-state-small': size === 'small', 'ui-state-large': size === 'large'}">
        <img v-if="flagUrl" :src="flagUrl" alt="" loading="lazy" decoding="async" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    name: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: ''
    }
})

const flagUrl = computed(() => {
    if(props.name) {
        const code = props.name.toLowerCase();
        return `/images/state/${code}.png`
    }
    return '';
})
</script>

<style scoped>
.ui-state-icon {
    flex-shrink: 0;
    width: 42px;
    height: 27px;
    overflow: hidden;
    border-radius: var(--ui-radius-xs);
    border: 1px solid #f5f5f5;
}
.ui-state-icon img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.ui-state-icon.ui-state-large {
    width: var(--ui-size-32);
    height: var(--ui-size-22);
}
.ui-state-icon.ui-state-small {
    width: var(--ui-size-22);
    height:var(--ui-size-16);
}
</style>
