<template>
  <UiPage ref="pageRef" :data="data">
    <div class="open-platform-page list-b-12">
      <div class="platform-hero">
        <div class="platform-hero-main">
          <div class="platform-title-row">
            <span>{{ $t('openPlatform.description') }}</span>
            <div class="platform-meta">
              <span v-for="item in statusCards" :key="item.label" :class="item.type">
                {{ item.label }} {{ item.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="securityBox">
        <div class="securityBox-list" v-for="list in lists" :key="list.label">
          <div class="securityBox-list-head">
            <div>
              <h3>{{ list.label }}</h3>
              <p>{{ $t('openPlatform.configureOrder') }}</p>
            </div>
            <span>{{ $t('openPlatform.itemCount', { count: list.children?.length || 0 }) }}</span>
          </div>
          <div class="securityBox-list-tbody" v-if="list.children?.length>0">
            <div class="securityBox-item" :class="item.tone" v-for="(item, index) in list.children" :key="index">
              <div class="icon-wrap" v-if="item.icon">
                <Icon :type="item.icon" size="22"/>
              </div>
              <div class="left">
                <div class="securityBox-item-thead">
                  <h4>{{ item.label }}</h4>
                  <template v-if="item.status && item.showStatus !== false">
                    <span class="status-capsule">{{ item.status }}</span>
                  </template>
                </div>
                <div class="desc">{{ item.desc }}</div>
                <div v-if="item.tip" class="tip" v-html="item.tip"></div>
              </div>
              <div class="right">
                <template v-if="item.btn">
                  <Button type="text" class="config-action" :loading="loadings[item.loadingKey]"  @click="btnClick(item)">
                    <span>
                      {{  item.btn.label }}
                    </span>
                  </Button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <OauthIptablesModal ref="OauthIptablesModalRef" @success="getInfo"/>
    <PubKeyModal ref="PubKeyModalRef" @success="getInfo"/>
    <WebhookModal ref="WebhookModalRef" @success="getInfo"/>
    <AuthorizationModal ref="AuthorizationModalRef" @success="getInfo"/>
  </UiPage>
</template>

<script setup>
import OauthIptablesModal from '@/views/ucenter/open-platform/components/OauthIptablesModal.vue'
import PubKeyModal from '@/views/ucenter/open-platform/components/PubKeyModal.vue'
import WebhookModal from '@/views/ucenter/open-platform/components/WebhookModal.vue'
import AuthorizationModal from '@/views/ucenter/open-platform/components/AuthorizationModal.vue'
import { ref,computed,onMounted,reactive } from 'vue'
import { toRoute } from '@/utils/route.js'
import { useUserStoreRefs } from '@/utils/store.js'
import { getApi,postApi} from '@/utils/api.js'
import { message,confirm } from '@/utils/message.js'
import { t } from '@/utils'
const pageRef=ref(null)
const {  user } = useUserStoreRefs()
const status=ref({
  allow_account:false,
  allow_api:false,
  authorization:"",
  oauth_iptables:"",
  pubkey:"",
  webhook:""
})
const data=reactive({
    notPage:true,
})
const loadings=reactive({
  pubkey:false,
  webhook:false,
  authorization:false,
  oauth_iptables:false,
})
const getConfirmOptions = () => ({
  title: t('message.promptTitle'),
  okText: t('button.confirm'),
  cancelText: t('button.cancel'),
})
const OauthIptablesModalRef=ref(null)
const PubKeyModalRef=ref(null)
const WebhookModalRef=ref(null)
const AuthorizationModalRef=ref(null)
const statusCards = computed(() => {
  const securityCount = [
    status.value.pubkey,
    status.value.oauth_iptables,
    status.value.authorization,
  ].filter(Boolean).length
  return [
    {
      label: t('openPlatform.status.securityItems'),
      value: `${securityCount}/3`,
      type: securityCount === 3 ? 'success' : 'warning',
    },
    {
      label: t('openPlatform.status.callbacks'),
      value: status.value.webhook ? t('openPlatform.status.on') : t('openPlatform.status.off'),
      type: status.value.webhook ? 'success' : 'neutral',
    },
    {
      label: t('openPlatform.status.ipRestriction'),
      value: status.value.oauth_iptables ? t('openPlatform.status.on') : t('openPlatform.status.off'),
      type: status.value.oauth_iptables ? 'success' : 'neutral',
    },
  ]
})
const lists=computed(() =>{
  return [
  {
    label: t('openPlatform.sectionTitle'),
    children:[
      {
        label: t('openPlatform.publicKey.label'),
        desc: status.value.pubkey ? t('openPlatform.publicKey.configuredDesc') : t('openPlatform.publicKey.unconfiguredDesc'),
        tip: `${t('openPlatform.publicKey.encryptionTip')}<a href="https://8gwifi.org/RSAFunctionality?keysize=1024" target="_blank" class="ml-10">${t('openPlatform.publicKey.onlineExample')}</a>`,
        icon:'md-key',
        tone:'tone-key',
        loadingKey:'pubkey',
        status: status.value.pubkey ? t('openPlatform.status.configured') : t('openPlatform.status.notConfigured'),
        showStatus:!status.value.pubkey,
        color:status.value.pubkey?'success':'error',
        btn:{
          label: status.value.pubkey ? t('openPlatform.change') : t('openPlatform.set'),
          type:status.value.pubkey?'default':'primary',
          click:()=>{
            PubKeyModalRef.value.open(status.value.pubkey)
          }
        },
      },
      {
        label: t('openPlatform.ipWhitelist.label'),
        desc: status.value.oauth_iptables ? t('openPlatform.ipWhitelist.configuredDesc') : t('openPlatform.ipWhitelist.unconfiguredDesc'),
        tip: t('openPlatform.ipWhitelist.tip'),
        icon:'md-globe',
        tone:'tone-ip',
        loadingKey:'oauth_iptables',
        status: status.value.oauth_iptables ? t('openPlatform.status.configured') : t('openPlatform.status.notConfigured'),
        showStatus:!status.value.oauth_iptables,
        color:status.value.oauth_iptables?'success':'error',
        btn:{
          label: status.value.oauth_iptables ? t('openPlatform.change') : t('openPlatform.set'),
          type:status.value.oauth_iptables?'default':'primary',
          click:()=>{
            OauthIptablesModalRef.value.open(status.value.oauth_iptables)
          }
        },
      },
      {
        label: t('openPlatform.webhook.label'),
        desc: t('openPlatform.webhook.desc'),
        icon:'md-analytics',
        tone:'tone-webhook',
        loadingKey:'webhook',
        status: status.value.webhook ? t('openPlatform.status.configured') : t('openPlatform.status.notConfigured'),
        showStatus:!status.value.webhook,
        color:status.value.webhook?'success':'error',
        btn:{
          label: status.value.webhook ? t('openPlatform.change') : t('openPlatform.set'),
          type:status.value.webhook?'default':'primary',
          click:()=>{
            WebhookModalRef.value.open(status.value.webhook)
          }
        },
      },
      {
        label: t('openPlatform.authorization.label'),
        desc: status.value.authorization ? t('openPlatform.authorization.configuredDesc') : t('openPlatform.authorization.unconfiguredDesc'),
        icon:'ios-wifi',
        tone:'tone-secret',
        loadingKey:'authorization',
        status: status.value.authorization ? t('openPlatform.status.configured') : t('openPlatform.status.notConfigured'),
        showStatus:!status.value.authorization,
        color:status.value.authorization?'success':'error',
        btn:{
          label: status.value.authorization ? t('openPlatform.reset') : t('openPlatform.set'),
          type:status.value.authorization?'default':'primary',
          click:()=>{
            resetAuthorization()
          }
        },
      },
    ]
  },
]
})
const btnClick=(item)=>{
  if (user.value.email_status !== 1 && user.value.google_auth_status !== 1) {
    confirm(t('openPlatform.authorization.securityRequired'), getConfirmOptions())
      .then(res=>{
        toRoute('ucenter_security')
      })
    return
  }
  item.btn?.click()
}
//重置通信密钥
const resetAuthorization = () => {
  const wasConfigured = Boolean(status.value.authorization)
  confirm(
    t(wasConfigured ? 'openPlatform.authorization.resetConfirm' : 'openPlatform.authorization.generateConfirm'),
    getConfirmOptions(),
  )
    .then(()=>{
      loadings.authorization = true
      postApi("/user/resetAuthorization").then(res=>{
        user.value.authorization = res
        status.value.authorization = res
        AuthorizationModalRef.value.open(res)
        message(t(wasConfigured ? 'openPlatform.authorization.resetSuccess' : 'openPlatform.authorization.setSuccess'))
      }).catch((err)=>{
        message(err?.msg, 'error')
      }).finally(()=>{
        loadings.authorization = false
      })
    })
}
const getInfo = async () => {
  if (pageRef.value) pageRef.value.loading = true
  try {
    const [securityRes, platformRes] = await Promise.all([
      getApi('/user/getSecuritySettings'),
      getApi('/user/getOpenPlatform')
    ])
    status.value = {
      ...securityRes,
      ...platformRes
    }
  } catch (err) {
    message(err?.msg, 'error')
  } finally {
    if (pageRef.value) pageRef.value.loading = false
  }
}
onMounted(()=>{
  getInfo()
})
</script>

<style scoped lang="less">
.open-platform-page{
  color: var(--ui-color-text);
}
.platform-hero{
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: var(--ui-padding-16);
  border: var(--ui-border-primary-muted);
  border-radius: var(--ui-radius-sm);
  background:
    linear-gradient(116deg, rgba(43, 92, 217, 0.12) 0%, rgba(43, 92, 217, 0.055) 44%, rgba(255, 255, 255, 0.98) 100%);
  box-shadow: 0 8px 20px rgba(31, 45, 77, 0.04);
  .platform-hero-icon{
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    border-radius: var(--ui-radius-sm);
    color: var(--primary-color);
    background: rgba(255, 255, 255, 0.86);
    box-shadow:
      inset 0 0 0 1px rgba(43, 92, 217, 0.1),
      0 6px 14px rgba(43, 92, 217, 0.08);
    flex-shrink: 0;
  }
  .platform-hero-main{
    min-width: 0;
    flex: 1;
  }
  .platform-title-row{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 24px;
    h3{
      margin: 0;
      font-size: 16px;
      line-height: 24px;
      flex-shrink: 0;
      color: var(--ui-color-neutral-900);
    }
  }
  .platform-meta{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap:16px;
    color: var(--ui-color-neutral-500);
    font-size: 12px;
    span{
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      &:before{
        content: '';
        width: var(--ui-size-6);
        height: var(--ui-size-6);
        border-radius: var(--ui-radius-circle);
        background: #c0c4cc;
      }
      &.success:before{
        background: #00a870;
      }
      &.warning:before{
        background: #ff9c19;
      }
      &.error:before{
        background: var(--ui-color-error-strong);
      }
    }
  }
  p{
    margin: 4px 0 0;
    color: var(--ui-color-neutral-700);
    font-size: 13px;
    line-height: 20px;
  }
}
.securityBox{
  .securityBox-list{
    border: var(--ui-border-muted);
    border-radius: var(--ui-radius-sm);
    background: #fff;
    overflow: hidden;
    box-shadow: 0 8px 22px rgba(31, 45, 77, 0.035);
    .securityBox-list-head{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: var(--ui-padding-14-18);
      background: linear-gradient(180deg, #fbfcff 0%, #f8faff 100%);
      border-bottom: 1px solid #eef2f7;
      h3{
        margin: 0;
        font-size: 15px;
        line-height: 22px;
        color: var(--ui-color-neutral-900);
      }
      p{
        margin: var(--ui-margin-2-0-0);
        color: var(--ui-color-neutral-500);
        font-size: 12px;
        line-height: 18px;
      }
      span{
        color: var(--ui-color-neutral-500);
        font-size: 12px;
        flex-shrink: 0;
      }
    }
    .securityBox-list-tbody{
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
      .securityBox-item{
        position: relative;
        min-height: 86px;
        padding: var(--ui-padding-16-18);
        border-bottom: 1px solid #eef2f7;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
        background: #fff;
        transition: border-color 0.2s ease, background 0.2s ease;
        &:last-child{
          border-bottom: none;
        }
        &:hover{
          background: #fafcff;
        }
        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--ui-size-40);
          height: var(--ui-size-40);
          background: #f5f8ff;
          color: var(--primary-color);
          border: var(--ui-border-primary-subtle);
          border-radius: var(--ui-radius-6);
          flex-shrink: 0;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        &:hover{
          .icon-wrap{
            background: #eef4ff;
            border-color: #cbdcff;
          }
        }
        &.tone-secret{
          --tone-color: var(--primary-color);
        }
        &.tone-ip{
          --tone-color: var(--primary-color);
        }
        &.tone-webhook{
          --tone-color: var(--primary-color);
        }
        &.tone-key{
          --tone-color: var(--primary-color);
        }
        .left{
          min-width: 0;
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 1px;
        }
        .desc{
          color: var(--ui-color-neutral-800);
          font-size: 13px;
          line-height: 18px;
        }
        .tip{
          color: #86909c;
          font-size: 12px;
          line-height: 18px;
        }
        .securityBox-item-thead{
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: var(--ui-size-20);
          h4{
            margin: 0;
            font-size: 14px;
            line-height: 20px;
            color: var(--ui-color-neutral-900);
          }
          .status-capsule{
            display: inline-flex;
            align-items: center;
            height: var(--ui-size-18);
            padding: var(--ui-padding-0-6);
            border-radius: var(--ui-radius-9);
            color: var(--ui-color-error-strong);
            font-size: 11px;
            line-height: 18px;
            background: #fff1f0;
            border: var(--ui-border-error-subtle);
            white-space: nowrap;
          }
        }
        .right{
          flex-shrink: 0;
          padding-top: 1px;
          :deep(.config-action){
            height: var(--ui-size-24);
            padding: 0;
            color: var(--primary-color);
          }
        }
      }
    }
  }
}
@media screen and (max-width: 768px) {
  .platform-hero{
    padding: var(--ui-padding-14);
    .platform-hero-icon{
      width: var(--ui-size-36);
      height: var(--ui-size-36);
    }
    .platform-title-row{
      flex-wrap: wrap;
      gap: 6px;
    }
    .platform-meta{
      justify-content: flex-start;
    }
    h3{
      font-size: 16px;
    }
  }
  .securityBox{
    .securityBox-list{
      .securityBox-list-tbody{
        .securityBox-item{
          min-height: auto;
          padding: var(--ui-padding-16);
          display: grid;
          grid-template-columns: var(--ui-size-40) minmax(0, 1fr) max-content;
          .tip{
            overflow-wrap: anywhere;
            :deep(a){
              display: inline-block;
              max-width: 100%;
              margin-left: 0 !important;
              white-space: nowrap;
            }
          }
          .right{
            min-width: max-content;
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
