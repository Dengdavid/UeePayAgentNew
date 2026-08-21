<template>
  <div class="PageCertification" >
    <div class="list-b-6">
       <h1>{{ $t('certify.pageCertification.title') }}</h1>
      <div class="desc">
        <p>{{ $t('certify.pageCertification.securityDescription') }}</p>
        <p>{{ $t('certify.pageCertification.serviceDescription') }}</p>
      </div>
    </div>
    <Divider>{{ $t('certify.pageCertification.benefitsTitle') }}</Divider>
    <div class="list">
      <div class="list-item" v-for="item in list" :key="item.titleKey">
        <div class="icon-box">
          <span class="iconfont" :class="item.icon"></span>
        </div>
        <div class="text-box">
          <p class="title">{{ $t(item.titleKey) }}</p>
          <p class="desc">{{ $t(item.descriptionKey) }}</p>
        </div>
      </div>
    </div>
    <Button type="primary" size="large" @click="toRoute('certify')">
      <span class="iconfont icon-shujuanquan m-r-4"></span>
      <span>{{ $t('certify.pageCertification.action') }}</span>
    </Button>
  </div>
</template>
<script setup>
import { toRoute } from '@/utils/route';
const list=[
  {
    titleKey:'certify.pageCertification.complianceTitle',
    descriptionKey:'certify.pageCertification.complianceDescription',
    icon:'icon-chakankaihuxinxi'
  },
  {
    titleKey:'certify.pageCertification.fullServiceTitle',
    descriptionKey:'certify.pageCertification.fullServiceDescription',
    icon:'icon-zongheiconmorenhui'
  },
  {
    titleKey:'certify.pageCertification.fundSecurityTitle',
    descriptionKey:'certify.pageCertification.fundSecurityDescription',
    icon:'icon-maijiabaozhang-shi'
  },
  {
    titleKey:'certify.pageCertification.privacyTitle',
    descriptionKey:'certify.pageCertification.privacyDescription',
    icon:'icon-CRMEB-fenxiaoyuanshenqing-mianxing'
  },
]

</script>
<style lang="less" scoped>
.PageCertification{
  min-height: 600px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap:32px;
  >*{
    margin: 0 !important;
  }
  padding: 40px 16px;
  h1{
    color: var(--primary-color);
  }
  .desc{
    text-align: center;
    color: var(--ui-color-text-secondary);
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0px;
    opacity: 1;
  }
  .ivu-divider{
    width: 60%;
    min-width: 300px;
    margin: var(--ui-margin-24-0);
    color: var(--ui-color-text);
  }
  .list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 800px;
    width: 100%;
    margin-bottom: 32px;
    text-align: left;

    .list-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: var(--ui-padding-20);
      border: 1px solid #ebf0f6;
      border-radius: var(--ui-card-radius-panel);
      background: var(--ui-card-background);
      transition: all var(--ui-motion-slow) var(--ui-ease-soft);

      &:hover {
        box-shadow: var(--ui-shadow-panel-hover);
        border-color: #d1d9e6;
        transform: translateY(-2px);
      }

      .icon-box {
        width: var(--ui-size-48);
        height: var(--ui-size-48);
        background: #eef4ff;
        border-radius: var(--ui-card-radius-panel);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .iconfont {
          font-size: 24px;
          color: var(--ui-color-primary);
        }
      }

      .text-box {
        flex: 1;

        .title {
          font-size: 16px;
          font-weight: bold;
          color: var(--ui-color-text);
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .desc {
          font-size: 13px;
          color: var(--ui-color-text-subtle);
          line-height: 1.6;
          text-align: left;
        }
      }
    }
  }

  // 手机端响应式适配
  @media screen and (max-width: 768px) {
    min-height: calc(100vh - 120px); // H5 高度适应
    padding: 24px 16px;
    gap: 24px; // 缩小垂直间距

    h1 {
      font-size: 24px; // 缩小标题
    }

    .desc {
      font-size: 13px;
    }

    .ivu-divider {
      width: 100%;
      min-width: auto; // 移除最小宽度防止小屏溢出
    }

    .list {
      grid-template-columns: 1fr;
      margin-bottom: 24px;
      gap: 12px;

      .list-item {
        padding: var(--ui-padding-16);
        gap: 12px;

        .icon-box {
          width: var(--ui-size-40);
          height: var(--ui-size-40);
          border-radius: var(--ui-radius-xl);

          .iconfont {
            font-size: 20px;
          }
        }

        .text-box {
          .title {
            font-size: 15px;
            margin-bottom: 4px;
          }
          .desc {
            font-size: 12px;
          }
        }
      }
    }

    // H5 的操作按钮变成全宽
    .ivu-btn {
      width: 100%;
    }
  }
}
</style>
