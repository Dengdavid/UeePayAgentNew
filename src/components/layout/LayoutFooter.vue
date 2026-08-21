<template>
    <footer class="footer">
      <div class="ui-layout flex-between list-r-32">
        <div class="foot-l list-b-32">
          <img class="logo" :src="logo" :alt="siteConfig.nameEn" />
          <div class="foot-l-info list-b-6">
            <p class="title">{{ $t('footer.contactUs') }}</p>
            <div class="desc-list list-b-4">
              <div class="desc-item">
                <span class="iconfont icon-shijian"></span>
                <p>{{ $t('footer.serviceHours') }}</p>
              </div>
              <div class="desc-item">
                <span class="iconfont icon-dianbao"></span>
                <p>
                  <span class="desc-label">{{ $t('footer.customerService') }}</span>
                  <a :href="customerUrl" target="_blank">{{ $t('footer.telegramSupport') }}</a>
                  <Divider type="vertical" />
                  <a :href="siteConfig.officialChannelUrl" target="_blank">{{ $t('footer.officialChannel') }}</a>
                </p>
              </div>
               <div class="desc-item">
                <span class="iconfont icon-youxiang"></span>
                <p>
                  <span class="desc-label">{{ $t('footer.businessEmail') }}</span>
                  <a :href="`mailto:${siteConfig.businessEmail}`">{{ siteConfig.businessEmail }}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="foot-m list-r-32">
          <router-link  :to="{ name:'helpList',params:{id:item.id} }" v-for="item in helps" :key="item.id">
            {{ item.title }}
          </router-link>
        </div>
        <div class="foot-r list-b-6">
          <FormEwm :url="hostH5" :logo="ewmLogo"/>
          <p class="text-center">{{ $t('footer.scanUserPortal') }}</p>
        </div>
      </div>
      <div class="ui-layout text-center  list-r-12">
        <span class="text">©{{ currentYear }} {{ siteConfig.domain }}</span>
        <Divider type="vertical"/>
        <span>{{ $t('footer.crossBorderDisclaimer') }}</span>
      </div>
    </footer>
</template>

<script setup>
import { getApi } from '@/utils/api.js'
import { siteConfig } from '@/config/site.js'
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { whiteRoutes } from '@/router/router.js'
import logo from '@/assets/images/logo.png'
import ewmLogo from '../../../favicon.ico'
const route = useRoute()

const menus = ref(whiteRoutes.filter((item) => !item.meta.hidden))
const helps=ref([])
import { useRouter } from 'vue-router'
const router = useRouter()
import { useAppStore } from '@/store/app.js'
import { storeToRefs } from 'pinia'
const appStore = useAppStore()
const { customerUrl } = storeToRefs(appStore)
const handlGoCustomer = (url) => {
  window.open(url, '_blank')
}
//当前路由
const hostH5=location.origin
const currentYear = new Date().getFullYear()
onMounted(() => {
  getApi('/help/cate').then((res) => {
    helps.value=res || []
  })
})
</script>

<style scoped lang="less">
.footer {
  padding: var(--ui-padding-20-0);
  color: var(--ui-color-neutral-550);
  background-color: #191D2D;
  .flex-between{
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .logo {
      display: block;
      width: auto;
      height: var(--ui-size-30);
      filter: brightness(0) invert(1);
  }
  >*{
    &:not(:last-child){
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  .text-center{
    text-align: center;
  }
  .title{
    color: var(--ui-color-text-inverse);
    font-size: 16px;
    font-weight: bold;
  }
  .foot-m{
    display: grid;
    grid-template-columns: repeat(4, minmax(140px, 1fr));
    gap: 16px;
    a{
      color: var(--ui-color-text-inverse);
      font-size: 14px;
      &:hover{
        text-decoration: underline;
      }
    }
  }
  .foot-r {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    :deep(.form-ewm .logo) {
      border-radius: var(--ui-radius-lg);
    }
  }
  .desc-list{
    .desc-item{
      display: flex;
      align-items: center;
      .iconfont{
        margin-right: 4px;
      }
      p{
        white-space: nowrap;
      }
      .desc-label{
        margin-right: 4px;
      }
      a{
        color: var(--ui-color-neutral-550);
        &:hover{
          text-decoration: underline;
        }
      }
    }
  }
  .ivu-divider-vertical{
    background-color: #595959 !important;
  }
}

</style>
