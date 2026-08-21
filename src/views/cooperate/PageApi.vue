<template>
  <div >
    <PageTitle :title="$t('cooperate.api.title')" :subtitle="$t('cooperate.api.subtitle')"/>
    <div class="api-list">
      <div class="api-item" v-for="(item,index) in apiList" :key="index">
        <div class="tag" :class="'tag'+(index+1)">{{ item.tag }}</div>
        <div class="icon">
          <IconBox :icon="item.icon" :size="26"></IconBox>
        </div>
        <h3>{{ item.label }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
  <div>
    <PageTitle :title="$t('cooperate.api.stepsTitle')" :subtitle="$t('cooperate.api.stepsSubtitle')"/>
    <div class="api-step">
      <div class="api-item" v-for="(item,index) in apiStep" :key="index">
        <div class="num">{{ index+1 }}</div>
        <h3>{{ item.label }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/utils'
const apiIcons = ['icon-shenjizhuizong', 'icon-baobiao', 'icon-wendangmoban', 'icon-kefufuwu', 'icon-fengkongxinxi', 'icon-cultivate']
const apiList = apiIcons.map((icon, index) => ({ icon, label: t(`cooperate.api.features.${index}.label`), tag: t(`cooperate.api.features.${index}.tag`), desc: t(`cooperate.api.features.${index}.desc`) }))
const apiStep = Array.from({ length: 4 }, (_, index) => ({ label: t(`cooperate.api.steps.${index}.label`), desc: t(`cooperate.api.steps.${index}.desc`) }))
</script>

<style scoped lang="less">
.api-step{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap:16px;
  margin-top: 32px;
  background: linear-gradient(36deg, #fff 80%, #eef5ff 100%);
  border-radius: var(--ui-radius-lg);
  padding:var(--ui-padding-24);
  box-shadow:  0 18px 32px rgba(178, 208, 255, 0.1);
  border: var(--ui-border-on-dark);
  position: relative;
  overflow: hidden;
  border: var(--ui-border-subtle);
  text-align: center;
  .api-item{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .num{
      font-size: 44px;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      //文字颜色渐变 透明到深蓝
      background: linear-gradient(0deg, #fff 30%, var(--primary-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom:-18px;
      position: relative;
      z-index:0;
    }
    h3{
      font-size:18px;
    }
    p{
      color: var(--grey-color);
      margin-top: 4px;
      font-size: 14px;
    }
  }
}
.api-list{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap:16px;
  margin-top: 32px;
  .api-item{
    background: linear-gradient(36deg, #fff 80%, #eef5ff 100%);
    border-radius: var(--ui-radius-lg);
    padding:var(--ui-padding-24);
    box-shadow:  0 18px 32px rgba(178, 208, 255, 0.1);
    position: relative;
    overflow: hidden;
    border: var(--ui-border-subtle);
    .icon{
      width:var(--ui-size-48);
      height: var(--ui-size-48);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--ui-radius-14);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(240, 246, 255, 0.96));
      border: var(--ui-border-overlay-soft);
      color: var(--primary-color);
      box-shadow: 0 8px 20px rgba(24, 61, 120, 0.06);
    }
    .tag{
      position: absolute;
      top: 0;
      right: 0 ;
      margin: 0;
      display: inline-block;
      padding:var(--ui-padding-2-8);
      background: var(--primary-color);
      color: var(--ui-color-text-inverse);
      font-size: 12px;
      letter-spacing: 0.08em;
      border-bottom-left-radius:4px;
      &.tag1{
        background: #67C23A;
      }
      &.tag2{
        background: #E6A23C;
      }
      &.tag3{
        background: var(--ui-color-error-strong);
      }
    }
    h3{
      font-size: 18px;
      font-weight: 700;
      line-height:1.2em;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    p{
      font-size: 14px;
      color: var(--grey-color);
    }
  }
}

@media screen and (max-width: 768px) {
  .api-step {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: var(--ui-padding-16);
  }
  .api-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
