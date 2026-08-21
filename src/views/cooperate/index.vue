<template>
  <div class="access-box">
    <div class="banner">
      <div class="auto">
        <div class="banner-left list-b-32">
          <div class="list-b-12">
            <h1>{{ $t('cooperate.hero.titleLine1') }}<br>{{ $t('cooperate.hero.titleLine2') }}</h1>
            <p>{{ $t('cooperate.hero.subtitle') }}</p>
          </div>
          <Button class="banner-btn" type="primary" :to="customerUrl" target="_blank" size="large">
            <span>{{ $t('cooperate.hero.consult') }}</span>
            <Icon type="md-arrow-forward" />
          </Button>
        </div>
        <div class="banner-right">

        </div>
      </div>
    </div>
    <div class="navs">
      <div class="auto">
        <div class="nav-item" :class="{active:current==index}" v-for="(item,index) in navs" :key="index" @click="current=index">
           <div class="nav-item-inner">
              <div class="text">
                <div class="title">
                  <h3>{{ item.label }}</h3>
                  <span class="tag" v-if="item.tag">{{ item.tag }}</span>
                </div>
                <p>{{ item.desc }}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
    <div class="auto main">
      <component :is="navs[current].component"></component>
    </div>
    <div class="foot">
       <div class="auto list-b-24">
        <div class="text">
          <h1>{{ $t('cooperate.hero.footerTitle') }}</h1>
          <p>{{ $t('cooperate.hero.footerSubtitle') }}</p>
        </div>
        <div class="btn">
          <Button class="banner-btn" type="primary" shape="circle" :to="customerUrl" target="_blank" size="large">
            <span>{{ $t('cooperate.hero.getPlan') }}</span>
            <Icon type="md-arrow-forward" />
          </Button>
        </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app.js'
const appStore = useAppStore()
const { customerUrl } = storeToRefs(appStore)
import PageApi from './PageApi.vue'
import PageAgent from './PageAgent.vue'
import { t } from '@/utils'

import { useRoute } from 'vue-router'
const route=useRoute()
const current=ref(route.query.type || 0)
const navs=[
  {
    label:t('cooperate.nav.api'),
    desc:t('cooperate.nav.apiDesc'),
    component:PageApi
  },
  {
    label:t('cooperate.nav.agent'),
    desc:t('cooperate.nav.agentDesc'),
    tag:t('cooperate.nav.recommended'),
    component:PageAgent
  }
]
</script>

<style scoped lang="less">
.access-box{
  .auto{
    width: 1200px;
    margin:0 auto;
  }
  .main{
    margin:64px auto;
    >*{
      &:not(:last-child){
        margin-bottom: 64px;
      }
    }
  }
  .foot{
    box-shadow: 0 16px 46px rgba(24, 61, 120, 0.08);
    padding:var(--ui-padding-40-0);
    border-radius: var(--ui-radius-16);
    text-align: center;
    background:url('@/assets/images/access_foot.jpg') no-repeat bottom;
    background-size: cover;
    .text{
      .section-kicker{
        display: inline-flex;
        align-items: center;
        padding: var(--ui-padding-7-12);
        border-radius: var(--ui-radius-full);
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        font-size: 12px;
        letter-spacing: 0.08em;
      }
      h1{
        font-size:32px;
        font-weight: 700;
        line-height:1.2em;
        margin-top: 16px;
        margin-bottom: 8px;
      }
      p{
        font-size: 14px;
      }
    }
  }
  :deep(.banner-btn){
    background: linear-gradient(90deg, #146fff, #1aa0ff);
    transition: .3s ease;
    border: none;
    min-width: 140px;
    padding: var(--ui-padding-0-24);
    font-weight: bold;
    > span{
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap:8px;
    }
    &:hover{
      background: linear-gradient(90deg, #247bff, #3af), linear-gradient(90deg, var(--ui-color-primary), #1aa0ff);
    }
  }
  .banner{
    background:#e5efff url('@/assets/images/access_banner.jpg') no-repeat center top;
    height:482px;
    background-size:cover;
    display: flex;
    align-items: center;
    justify-content:center;
    padding-bottom: 70px;
    .auto{
      display: flex;
      justify-content:space-between;
    }
    .banner-left{
      h1{
        font-size: 48px;
        font-weight: 700;
        line-height:1.2em;
      }
      p{
        font-size: 16px;
        color: var(--ui-color-text);
      }
      .sub{
        display: inline-block;
        background: rgba(255, 255, 255, 0.78);
        border: 1px solid rgba(99, 91, 255, 0.1);
        padding: 10px 20px;
        border-radius: var(--ui-radius-full);
        letter-spacing: 0.06em;
        font-size: 12px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        color: var(--primary-color);
      }
    }
  }
  .navs{
    --h:60px;
    background:rgba(255, 255,255, 0.2);
    backdrop-filter: blur(20px);
    border-top: 1px rgba(255, 255,255, 0.5) solid;
    height: var(--h);
    margin-top:-60px;
    .auto{
      display: flex;
      text-align: end;
      position: relative;
      top: -11px;
      overflow: hidden;
      border-radius: 10px 10px 0 0;
    }
    .nav-item{
      flex: 1;
      text-align: center;
      cursor: pointer;
      position: relative;
      .text{
        height: var(--h);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .title{
          display: flex;
          align-items: center;
          gap: 4px;
        }
        p{
          opacity: 0.8;
        }
        position: relative;
        .tag{
          position: absolute;
          right: -4px;
          top:-6px;
          background: var(--ui-color-error-strong);
          box-shadow: 0 2px 8px 0 rgba(255, 255, 255, 0.2);
          color: var(--ui-color-text-inverse);
          padding:var(--ui-padding-3-8);
          border-radius: var(--ui-radius-full);
          font-size:10px;
          letter-spacing: 0.08em;
        }
      }
      .nav-item-inner{
        position: relative;
        padding-top:10px;
        //css梯形
        border-top-left-radius:10px;
        border-top-right-radius:10px;
        margin:0 -40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      &:hover{
        color: var(--primary-color);
      }
      &.active{
        .nav-item-inner{
          color: var(--ui-color-text-inverse);
        }
        &:first-child{
          &.nav-item{
            border-top-left-radius:10px;
          }
          .nav-item-inner{
            background: linear-gradient(0, #477eff -10%, var(--ui-color-primary) 100%);
            transform: skewX(30deg);
          }
          .text{
            transform: skewX(-30deg);
          }
        }
        &:last-child{
          &.nav-item{
            border-top-right-radius:10px;
          }
          .nav-item-inner{
            background: linear-gradient(0, #ffc053 -10%, #e87d0a 100%);
            transform: skewX(-30deg);
          }
          .text{
            transform: skewX(30deg);
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .access-box {
    .auto {
      width: 100%;
      padding: var(--ui-padding-0-15);
      box-sizing: border-box;
    }
    .main {
      margin: 32px auto;
      > * {
        &:not(:last-child) {
          margin-bottom: 32px;
        }
      }
    }
    .banner {
      height: auto;
      padding: 60px 0 100px;
      .auto {
        flex-direction: column;
        text-align: center;
      }
      .banner-left {
        h1 {
          font-size: 32px;
        }
        p {
          font-size: 14px;
        }
        .banner-btn {
          margin-top: 20px;
        }
      }
    }
    .navs {
      height:var(--ui-size-44);
      margin-top: -44px;
      .auto {
        top: 0;
        border-radius: 0;
        padding: 0;
        display: flex;
        overflow: initial !important;
      }
      .nav-item {
        border-radius: 0;
        .nav-item-inner {
          margin: 0;
          border-radius: 0 !important;
          transform: none !important;
          padding: 0;
        }
        .text {
          transform: none !important;
          height:var(--ui-size-44);
          p {
            display: none;
          }
        }
        &.active .nav-item-inner, &.active .text {
          transform: none !important;
          padding: 0;
        }
        &:first-child .nav-item-inner, &:first-child .text,
        &:last-child .nav-item-inner, &:last-child .text {
          transform: none !important;
        }
      }
    }
    .foot {
      padding: 30px 15px;
      border-radius: 0;
      .text h1 {
        font-size: 24px;
      }
    }
  }
}
</style>
