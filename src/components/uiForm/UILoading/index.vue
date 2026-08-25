<template>
  <Spin fix>
    <div class="app-loading" role="status" :aria-label="$t('appLoading.label')">
      <div class="app-loading__progress" aria-hidden="true">
        <span></span>
      </div>
      <p class="app-loading__text">{{$t('appLoading.label') }}</p>
    </div>
  </Spin>
</template>

<script setup>
import { useAppStoreRefs } from '@/utils/store.js'
const {configDatas} = useAppStoreRefs()
const props = defineProps({
  title:''
})
</script>

<style scoped lang="less">

.app-loading{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  &__logo{
    display: flex;
    align-items: center;
    justify-content: center;

    img{
      display: block;
      max-height:30px;
    }
  }

  &__progress{
    width: var(--ui-size-96);
    height: var(--ui-size-3);
    overflow: hidden;
    border-radius: var(--ui-radius-3);
    background: rgba(43, 92, 217, 0.12);

    span{
      display: block;
      width: 42%;
      height: 100%;
      border-radius: inherit;
      background: var(--primary-color);
      animation: app-loading-progress 1.35s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  }

  &__text{
    margin: var(--ui-margin-neg-4-0-0);
    color: var(--grey-color);
    font-size: 12px;
    line-height: 18px;
  }
}

@keyframes app-loading-progress{
  0%{
    opacity: 0.45;
    transform: translateX(-110%);
  }
  45%{
    opacity: 1;
  }
  100%{
    opacity: 0.45;
    transform: translateX(240%);
  }
}

@media (prefers-reduced-motion: reduce){
  .app-loading{
    &__progress span{
      animation: none;
      transform: none;
    }
  }
}
</style>
