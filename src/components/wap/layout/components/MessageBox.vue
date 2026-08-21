<template>
  <Tooltip class="iconTooltip" placement="top" :content="$t('route.messageCenter')" :disabled="disabled" v-if="isLogin">
    <button
      type="button"
      class="thead-icon"
      :aria-label="$t('route.messageCenter')"
      @click.stop="toRoute('ucenter_message')"
    >
        <Badge :count="unreadNum">
            <Icon :class="{
            'icon-unread': unreadNum > 0
            }" type="md-notifications" size="18"/>
        </Badge>
    </button>
  </Tooltip>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { toRoute } from '@/utils/route.js'
import { useUserStoreRefs } from '@/utils/store'
const { unreadNum,isLogin } = useUserStoreRefs()
const props = defineProps({
    disabled:{ //
        type:Boolean,
        default:true
    }
})
onMounted(()=>{

})
</script>

<style lang="less" scoped>
  .thead-icon{
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-size-34);
    min-height: 32px;
    padding: 0;
    color: var(--primary-color);
    font: inherit;
    line-height: 1;
    border: 0;
    border-radius: var(--ui-radius-md);
    background: transparent;
    cursor: pointer;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover,
    &:focus-visible {
      color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 6%, var(--white-color));
      outline: none;
    }

    .ivu-icon{
      transition: all .2s ease;
      color: currentColor;
    }
    :deep(.ivu-badge-count){
      transform:scale(0.8);
      left:8px;
      right:initial;
    }
  }
  @keyframes ring {
    0% { transform: rotate(0); }
    10% { transform: rotate(15deg); }
    20% { transform: rotate(-10deg); }
    30% { transform: rotate(10deg); }
    40% { transform: rotate(-10deg); }
    50% { transform: rotate(5deg); }
    60% { transform: rotate(-5deg); }
    70% { transform: rotate(2deg); }
    80% { transform: rotate(-2deg); }
    90% { transform: rotate(1deg); }
    100% { transform: rotate(0); }
  }
  .icon-unread {
    transform-origin: top center;
    animation: ring 2s infinite ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .thead-icon,
    .thead-icon .ivu-icon {
      transition: none;
    }
  }
</style>
