<template>
   <div>
    <PageTitle :title="$t('cooperate.agent.title')" :subtitle="$t('cooperate.agent.subtitle')"/>
    <div class="agent-list">
      <div class="agent-item" v-for="(item,index) in agentList" :key="index">
        <div class="icon">
          <IconBox :icon="item.icon" :size="26"></IconBox>
        </div>
        <h3>{{ item.label }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
  <div>
    <PageTitle :title="$t('cooperate.agent.safetyTitle')" :subtitle="$t('cooperate.agent.safetySubtitle')"/>
    <div class="agent-safe">
      <div class="agent-safe-item" :style="{
        backgroundImage:`url(${item.bg})`
      }" v-for="(item,index) in safeList" :key="index">
        <div class="text">
          <h3>{{ item.label }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
  <div>
    <PageTitle :title="$t('cooperate.agent.stepsTitle')" :subtitle="$t('cooperate.agent.stepsSubtitle')"/>
    <div class="api-step">
      <div class="api-item" v-for="(item,index) in agentStep" :key="index">
        <div class="num">{{ index+1 }}</div>
        <h3>{{ item.label }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/utils'
const agentIcons = ['icon-shujukaifajiaobenkaifa', 'icon-pinpai', 'icon-shouyi1', 'icon-chengshi', 'icon-fangjiandingjia', 'icon-zhanghaotuoguan']
const agentList = agentIcons.map((icon, index) => ({ icon, label: t(`cooperate.agent.features.${index}.label`), desc: t(`cooperate.agent.features.${index}.desc`) }))
import bg1 from '@/assets/images/access_bg_1.jpg'
import bg2 from '@/assets/images/access_bg_2.jpg'
import bg3 from '@/assets/images/access_bg_3.jpg'
import bg4 from '@/assets/images/access_bg_4.jpg'
const safetyBackgrounds = [bg1, bg2, bg3, bg4]
const safeList = safetyBackgrounds.map((bg, index) => ({ bg, label: t(`cooperate.agent.safety.${index}.label`), desc: t(`cooperate.agent.safety.${index}.desc`) }))
const agentStep = Array.from({ length: 4 }, (_, index) => ({ label: t(`cooperate.agent.steps.${index}.label`), desc: t(`cooperate.agent.steps.${index}.desc`) }))
</script>

<style scoped lang="less">

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
.api-step{
  display: flex;
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
    flex: 1;
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
.agent-safe{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin-top: 32px;
  background: #fff;
  overflow: hidden;
  gap:8px;
  .agent-safe-item{
    background: #fff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    border-radius: var(--ui-radius-2xl);
    overflow: hidden;
    border: 1px solid #eee;
    background-size: cover 100%;
    background-repeat: no-repeat;
    background-position: center right;
    display: grid;
    position: relative;
    &::after{
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 30%, transparent 100%);
      z-index: 1;
    }
    .text{
      flex: 1;
      overflow: hidden;
      padding:32px 300px 32px 32px;
      box-sizing: border-box;
      position: relative;
      z-index: 2;
    }
    h3{
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    p{
      font-size: 14px;
      color: var(--ui-color-text-subtle);
    }
  }
}
.agent-list{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 32px;
  .agent-item{
    padding: var(--ui-padding-24);
    border-radius: var(--ui-radius-2xl);
    background: #fff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    background: linear-gradient(36deg, #fff 80%, #eef5ff 100%);
    border: var(--ui-border-subtle);
    &.column_3{
      grid-column: span 3;
    }
    &.column_2{
      grid-column: span 2;
    }
    h3{
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      margin-top: 16px;
    }
    p{
      font-size: 14px;
      color: var(--ui-color-text-subtle);
    }
  }
}

@media screen and (max-width: 768px) {
  .agent-list {
    grid-template-columns: 1fr;
    gap: 16px;
    .agent-item {
      &.column_3, &.column_2 {
        grid-column: span 1;
      }
    }
  }
  .agent-safe {
    grid-template-columns: 1fr;
    .agent-safe-item {
      .text {
        padding: var(--ui-padding-24);
      }
      &::after {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.7) 100%);
      }
    }
  }
  .api-step {
    flex-direction: column;
    gap: 24px;
    padding: var(--ui-padding-16);
  }
}
</style>
