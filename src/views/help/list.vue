<template>
  <UiPage ref="pageRef" isNotBg isBack :fallback="{name:'helpIndex'}"  isNotTitle :padding="0">
    <div class="pageWidth">
      <Breadcrumb v-if="!isPhone">
        <BreadcrumbItem to="/help">
          <Icon type="md-home" size="18" color="var(--ui-color-text)" />
          <span>{{ $t('help.center') }}</span>
        </BreadcrumbItem>
        <BreadcrumbItem v-if="muneRow">{{ muneRow?.title }}</BreadcrumbItem>
      </Breadcrumb>
      <div class="main">
        <div class="main__mune" ref="menuRef">
          <ul>
            <li :class="{
              'active':item.id==routeParamsId
            }" @click="goMune(item)" v-for="item in category" :key="item.id">{{ item.title }}</li>
          </ul>
        </div>
        <div class="main__center">
          <div class="main__center__thead list-b-6" v-if="muneRow">
            <div class="main__center__title">
              <h1>{{ muneRow?.title }}</h1>
              <span class="main__center__count" v-if="!loading && tabel.total > 0">
                <Icon type="md-list-box" />
                {{ $t('help.articleCount', { count: tabel.total }) }}
              </span>
            </div>
            <p class="main__center__desc">{{ muneRow?.desc  }}</p>
          </div>
          <div class="main__center__list">
            <Spin fix v-if="loading" ></Spin>
            <template v-if="tabel.tbody?.length>0">
              <button
                class="main__center__list__item"
                v-for="item in tabel.tbody"
                :key="item.id"
                type="button"
                @click="goDetail(item)"
              >
                <div class="main__center__list__item__content">
                  <div class="main__center__list__item__body">
                    <div class="main__center__list__item__tags" v-if="item.tags">
                      <span v-for="(tag, tIdx) in item.tags.split(',')" :key="tIdx">
                        # {{ tag }}
                      </span>
                    </div>
                    <h2 class="main__center__list__item__title">{{ item.title }}</h2>
                    <p class="main__center__list__item__desc" v-if="item.desc">{{ item.desc }}</p>
                  </div>
                  <div class="main__center__list__item__footer">
                    <div class="time">
                      <!-- <Icon type="ios-time" /> -->
                      <span>{{ $t('help.updatedAt', { date: item.updated_at || '-' }) }}</span>
                    </div>
                    <div>
                      <Icon type="md-thumbs-up" />
                      <span>{{ $t('help.recommendations', { count: item.resolved_nums || 0 }) }}</span>
                    </div>
                    <div>
                      <Icon type="md-eye" />
                      <span>{{ $t('help.views', { count: item.view_nums || 0 }) }}</span>
                    </div>
                  </div>
                </div>
                <span class="main__center__list__item__arrow" aria-hidden="true">
                  <Icon type="ios-arrow-forward" size="17" />
                </span>
              </button>
              <div class="main__center__page">
                <UiTablePage :data="tabel" @search="getTbody"/>
              </div>
            </template>
            <template v-else>
              <UiEmptyBox :text="$t('help.noArticles')" />
            </template>
          </div>
        </div>
      </div>
   </div>
  </UiPage>
</template>

<script setup>
import {onMounted,ref,reactive,computed, nextTick, watch} from 'vue'
import { getApi } from '@/utils/api.js'
import { isPhone } from '@/utils/device.js'
import {toRoute,useRouteParams} from '@/utils/route'

const routeParams=useRouteParams()
const routeParamsId=ref(routeParams.id)

const goDetail = (item) => {
  toRoute('helpDetails', { id:item.id }, 'params')
}
const props=defineProps({
  category:{
    type:Array,
    default:()=>[]
  }
})
const pageRef=ref(null)
const menuRef=ref(null)
const tabel=reactive({
  tbody:[],
  total:0,
  search:{
    keyword: '',
  },
  page:{
    page: 1,
    limit: 10,
  }
})
const muneRow=computed(()=>{
  return props.category.find((item)=>item.id==routeParamsId.value) || null
})
const scrollToActiveCategory=()=>{
  if(!isPhone) return
  nextTick(() => {
    const menu = menuRef.value
    const activeItem = menu?.querySelector('li.active')
    if(!menu || !activeItem) return

    const targetLeft = activeItem.offsetLeft - (menu.clientWidth - activeItem.offsetWidth) / 2
    const maxScrollLeft = Math.max(menu.scrollWidth - menu.clientWidth, 0)
    const left = Math.min(Math.max(targetLeft, 0), maxScrollLeft)
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'

    menu.scrollTo({ left, behavior })
  })
}
const goMune=(item)=>{
  routeParamsId.value=item.id
  toRoute('helpList',{id:item.id},'params',{ replace:true })
  getTbody(item.id)
}
const loading=ref(false)
const getTbody=(id=routeParamsId.value)=>{
  if(!id) return
  nextTick(() => {
    loading.value=true
    getApi('help/list',{
      cate_id: id,
      ...tabel.search,
      ...tabel.page
    }).then((res) => {
      tabel.tbody=res.data
      tabel.total=res.total
    }).finally(() => {
      loading.value=false
    })
  })
}

onMounted(() => {
  getTbody()
})

watch(
  [routeParamsId, () => props.category.length],
  scrollToActiveCategory,
  { immediate: true, flush: 'post' }
)

</script>

<style scoped lang="less">
@import './style.less';
.pageWidth{
  margin:var(--ui-margin-16-auto) !important;
  display: flex;
  flex-direction: column;
  gap:16px;
  .main{
    display: flex;
    align-items: flex-start;
    gap:16px;
    >*{
      background: #fff;
      border-radius: var(--ui-radius-lg);
      box-shadow: 0 4px 16px rgba(31, 45, 77, 0.03);
    }
    &__mune{
      width:180px;
      position: sticky;
      top: calc(var(--sticky-header-height, 56px) + 16px);
      padding: var(--ui-padding-8);
      ul{
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        li{
          min-height: 40px;
          padding:var(--ui-padding-10-12);
          border-radius: var(--ui-radius-6);
          font-size:14px;
          line-height: 20px;
          cursor: pointer;
          position: relative;
          transition: color 160ms ease, background-color 160ms ease;
          &:hover{
            color: var(--primary-color);
            background: #f7f9fd;
          }
          &.active{
            color: var(--primary-color);
            background: #f2f6ff;
            font-weight: 600;
            &::before{
              content: '';
              position: absolute;
              top: 9px;
              bottom: 9px;
              left: -8px;
              width:var(--ui-size-3);
              border-radius: var(--ui-radius-0-3-3-0);
              background: var(--primary-color);
            }

          }
        }
      }
    }
    &__center{
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      >*{
        padding: var(--ui-padding-16);
        &:not(:last-child){
          border-bottom: 1px solid var(--ui-color-border-subtle);
        }
      }
      &__page{
        display: flex;
        justify-content: center;
        padding: var(--ui-padding-16);
      }
      &__thead{
        padding:14px 20px 13px;
        background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
      }
      &__title{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        h1{
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: var(--ui-color-text);
          font-size:18px;
          font-weight: 600;
          line-height: 1.4;

          &::before {
            width: var(--ui-size-3);
            height: var(--ui-size-16);
            border-radius: var(--ui-radius-3);
            background: var(--primary-color);
            content: '';
          }
        }
      }
      &__count{
        display: inline-flex;
        flex: none;
        align-items: center;
        gap: 4px;
        padding: var(--ui-padding-3-8);
        border-radius: var(--ui-radius-full);
        background: #f0f4ff;
        color: #5473bd;
        font-size: 12px;
        font-weight: 500;
        line-height: 17px;
      }
      &__desc{
        width: calc(100% - 11px);
        max-width: none;
        margin: 4px 0 0 11px;
        box-sizing: border-box;
        color: var(--ui-color-neutral-600);
        font-size: 13px;
        line-height: 1.6;
      }
      &__list{
        position: relative;
        padding: 0;
        &__item{
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          margin: 0;
          padding: 24px 64px 22px 24px;
          overflow: hidden;
          border: 0;
          border-bottom: 1px solid #edf1f6;
          border-radius: 0;
          background: #fff;
          appearance: none;
          box-sizing: border-box;
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-align: left;
          transition: background-color 180ms ease;

          &::before {
            position: absolute;
            top: 16px;
            bottom: 16px;
            left: 0;
            width: var(--ui-size-3);
            border-radius: var(--ui-radius-0-3-3-0);
            background: var(--primary-color);
            content: '';
            opacity: 0;
            transform: scaleY(0.55);
            transition: opacity 180ms ease, transform 180ms ease;
          }
          &:hover {
            background: #fbfdff;

            &::before {
              opacity: 1;
              transform: scaleY(1);
            }

            .main__center__list__item__title {
              color: var(--primary-color);
            }

            .main__center__list__item__arrow {
              color: var(--primary-color);
              background: #eef3ff;
              opacity: 1;
              transform: translate(3px, -50%);
            }
          }

          &:focus-visible {
            outline: 3px solid rgba(43, 92, 217, 0.16);
            outline-offset: -3px;
          }

          &__content {
            flex: 1;
            min-width: 0;
          }

          &__body {
            display: flex;
            min-width: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
          }

          &__title{
            display: -webkit-box;
            margin: 0;
            overflow: hidden;
            color: var(--ui-color-text);
            font-size: 18px;
            font-weight: 600;
            line-height: 1.45;
            word-break: break-word;
            transition: color 180ms ease;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          &__desc{
            display: -webkit-box;
            margin: var(--ui-margin-6-0-0);
            overflow: hidden;
            max-width: 880px;
            color: #66758b;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.65;
            word-break: break-word;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          &__tags{
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin: var(--ui-margin-0-0-10);

            span{
              padding: var(--ui-padding-2-7);
              border: 0;
              border-radius: var(--ui-radius-sm);
              background: #f2f5fd;
              color: #5270b6;
              font-size: 12px;
              font-weight: 500;
              line-height: 18px;
            }
          }

          &__footer{
            display: flex;
            width: 100%;
            align-items: center;
            gap: 20px;
            margin-top: 16px;
            color: var(--ui-color-text-muted);

            div{
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              line-height: 20px;

              i {
                color: var(--ui-color-text-secondary);
              }

              strong {
                color: var(--ui-color-neutral-700);
                font-weight: 600;
                font-variant-numeric: tabular-nums;
              }
            }

            .time {
              margin-right: auto;
            }
          }

          &__arrow {
            position: absolute;
            top: 50%;
            right: 20px;
            display: inline-flex;
            width: var(--ui-size-30);
            height: var(--ui-size-30);
            align-items: center;
            justify-content: center;
            border-radius: var(--ui-radius-circle);
            color: #aab5c5;
            opacity: 0.72;
            transform: translate(0, -50%);
            transition: color 180ms ease, background-color 180ms ease, opacity 180ms ease, transform 180ms ease;
          }
        }
      }
    }
  }
}

@media (max-width: 767px) {
  .pageWidth {
    gap: 0;
    margin: 0 auto !important;
    padding: 0;

    .main {
      flex-direction: column;
      gap: 0;

      > * {
        border-radius: 0;
        box-shadow: none;
      }

      &__mune {
        position: sticky;
        top: 0;
        z-index: 20;
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        padding: var(--ui-padding-6);
        border-bottom: 1px solid #edf1f6;
        background: #fff;
        box-shadow: 0 4px 12px rgba(31, 45, 77, 0.06);
        scrollbar-width: none;

        &::-webkit-scrollbar {
          display: none;
        }

        ul {
          flex-direction: row;
          gap: 4px;

          li {
            min-height: 36px;
            flex: none;
            padding: var(--ui-padding-8-12);
            white-space: nowrap;

            &.active::before {
              top: auto;
              right: 12px;
              bottom: -6px;
              left: 12px;
              width: auto;
              height: var(--ui-size-2);
              border-radius: 2px 2px 0 0;
            }
          }
        }
      }

      &__center {
        width: 100%;

        &__page {
          overflow: hidden;
          padding: var(--ui-padding-14-16);

          :deep(.ivu-page) {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;
            flex-wrap: nowrap;
            gap: 4px;
            white-space: nowrap;
          }

          :deep(.ivu-page-total) {
            margin-right: 6px;
          }

          :deep(.ivu-page-prev),
          :deep(.ivu-page-item),
          :deep(.ivu-page-next) {
            flex: none;
            margin-right: 0;
          }

          :deep(.ivu-page-options) {
            display: none;
          }
        }

        &__thead {
          padding: 14px 14px 12px;
        }

        &__title {
          h1 {
            font-size: 17px;
          }
        }

        &__desc {
          margin-left: 11px;
        }

        &__list {
          padding: 0;

          &__item {
            min-height: 0;
            align-items: flex-start;
            padding: 20px 46px 18px 16px;

            &__title {
              padding-right: 0;
              font-size: 16px;
              line-height: 1.5;
            }

            &__desc {
              margin-top: 5px;
              font-size: 13px;
              line-height: 1.65;
              -webkit-line-clamp: 2;
            }

            &__tags {
              gap: 5px;

              span {
                padding: var(--ui-padding-2-7);
              }
            }

            &__footer {
              flex-wrap: wrap;
              gap: 6px 12px;
              margin-top: 12px;

              .time {
                width: 100%;
                flex-basis: 100%;
                margin-right: 0;
              }
            }

            &__arrow {
              right: 10px;
            }

          }
        }
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .main__center__list__item {
    transition-duration: 0.01ms;
  }
}
</style>
