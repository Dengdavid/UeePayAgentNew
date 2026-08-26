<template>
  <UiPage ref="pageRef" :data="data">
    <div class="security-page list-b-12">
      <div class="security-hero">
        <div class="security-hero-main">
          <div class="security-title-row">
            <div class="security-summary">
              <p>{{ t('security.overview.description') }}</p>
            </div>
            <div class="security-level">
              <span>{{ t('security.overview.currentLevel') }}</span>
              <strong :class="securityLevelClass">{{ securityLevelText }}</strong>
            </div>
            <div class="security-progress">
              <div class="progress-head">
                <span>{{ t('security.overview.progress') }}</span>
                <strong>{{ securityCompleted }}/{{ securityTotal }}</strong>
              </div>
              <Progress :percent="securityProgress" :stroke-width="6" :stroke-color="securityProgressColor" hide-info />
            </div>
          </div>
        </div>
      </div>
      <div class="securityBox">
        <div class="securityBox-list" v-for="list in lists" :key="list.label">
          <div class="securityBox-list-head">
            <div>
              <h3>{{ list.label}}</h3>
              <p>{{ list.desc }}</p>
            </div>
            <div class="securityBox-head-extra">
              <span>{{ t('security.overview.itemCount', { count: list.children?.length || 0 }) }}</span>
              <template v-if="list.btn">
                <Button type="text" class="head-action" @click="toRoute(list.btn.routeName)">
                  <span>{{ list.btn.label }}</span>
                  <Icon type="ios-arrow-forward" />
                </Button>
              </template>
            </div>
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
              </div>
              <div class="right">
                <template v-if="item.btn">
                  <Button type="text" class="config-action" :loading="loadings[item.loadingKey]"  @click="item.btn?.click()">
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
    <PasswordModal ref="passwordModalRef"/>
    <IpWhitelistModal ref="ipWhitelistModalRef" @success="getInfo"/>
    <EmailModal ref="emailModalRef" @success="getInfo"/>
    <EmailBindingModal ref="emailBindingModalRef" @success="getInfo"/>
    <EmailVerificationModal ref="emailVerificationModalRef" @success="getInfo"/>
    <GoogleModal ref="googleModalRef" @success="getInfo"/>
  </UiPage>
</template>

<script setup>
import { ref,computed,nextTick,onMounted,reactive,watch } from 'vue'
import { removeQuery, toRoute, useRoute } from '@/utils/route.js'
import { getApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
import { userApi } from '@/api'
import PasswordModal from './components/PasswordModal.vue'
import IpWhitelistModal from './components/IpWhitelistModal.vue'
import EmailModal from './components/EmailModal.vue'
import EmailBindingModal from './components/EmailBindingModal.vue'
import EmailVerificationModal from './components/EmailVerificationModal.vue'
import GoogleModal from './components/GoogleModal.vue'
const GOOGLE_BINDING_ACTION = 'bind-google'
const route=useRoute()
const pageRef=ref(null)
const settingsLoaded=ref(false)
const status=ref({
  single_login:0,
  iptables:null,
  email_status:0,
  google_auth_status:0,
  email:""
})
const data=reactive({
    notPage:true,
})
const passwordModalRef=ref(null)
const ipWhitelistModalRef=ref(null)
const emailModalRef=ref(null)
const emailBindingModalRef=ref(null)
const emailVerificationModalRef=ref(null)
const googleModalRef=ref(null)
const loadings=reactive({
  login_password:false,
  single_login:false,
  iptables:false,
  email_status:false,
  google_auth_status:false,
})
const securityTotal = 4
const securityCompleted = computed(() => {
  return [
    status.value.email_status,
    status.value.google_auth_status,
    status.value.single_login,
    status.value.iptables,
  ].filter(Boolean).length
})
const securityProgress = computed(() => {
  return Math.round((securityCompleted.value / securityTotal) * 100)
})
const securityLevelText = computed(() => {
  if (securityProgress.value >= 100) return t('security.overview.levelHigh')
  if (securityProgress.value >= 50) return t('security.overview.levelMedium')
  return t('security.overview.levelLow')
})
const securityLevelClass = computed(() => {
  if (securityProgress.value >= 100) return 'level-high'
  if (securityProgress.value >= 50) return 'level-medium'
  return 'level-low'
})
const securityProgressColor = computed(() => {
  if (securityProgress.value >= 100) return '#00a870'
  if (securityProgress.value >= 50) return '#f59e0b'
  return 'var(--ui-color-error-strong)'
})
// 检查是否有验证方式
const isNotRz=()=>{
  if(!status.value.email_status && !status.value.google_auth_status){
     message(t('security.verificationRequired'), 'warning')
    return true
  }
  return false
}
const toggleSingleLogin = async () => {
  if (loadings.single_login) return

  const nextStatus = status.value.single_login ? 0 : 1
  loadings.single_login = true
  try {
    await userApi.setSingleLogin({ single_login: nextStatus })
    status.value.single_login = nextStatus
    message(t(nextStatus ? 'security.singleLoginEnabled' : 'security.singleLoginDisabled'))
    getInfo()
  } catch (error) {
    if (error?.msg === 'SILENT_ERROR' || Number(error?.code) === -991) return

    if (['ERR_NETWORK', 'ERR_NETWORK_CHANGED'].includes(error?.code)) return

    message(
      error?.msg || error?.message || t('security.singleLoginFailed'),
      'error'
    )
  } finally {
    loadings.single_login = false
  }
}
const lists=computed(() =>{
  return [
  {
    label: t('security.overview.loginConfig'),
    desc: t('security.overview.loginConfigDesc'),
    btn:{
      label: t('security.overview.viewDevices'),
      type:'primary',
      routeName:'ucenterLoginRecords',
    },
    children:[
      {
        label: t('security.overview.loginPassword'),
        desc: t('security.overview.loginPasswordDesc'),
        icon:'md-lock',
        tone:'tone-password',
        loadingKey:'login_password',
        btn:{
          label: t('security.overview.change'),
          click:()=>{
            if(isNotRz()) return
            passwordModalRef.value.open()
          }
        },
      },
      {
        label: t('security.overview.singleLogin'),
        desc: status.value.single_login ? t('security.overview.singleLoginOnDesc') : t('security.overview.singleLoginOffDesc'),
        icon:'md-phone-portrait',
        tone:'tone-device',
        loading:false,
        status: status.value.single_login ? t('security.overview.enabled') : t('security.overview.disabled'),
        showStatus:!status.value.single_login,
        color:status.value.single_login?'success':'error',
        loadingKey:'single_login',
        btn:{
          label: status.value.single_login ? t('security.overview.disable') : t('security.overview.enable'),
          type:status.value.single_login?'default':'primary',
          click:()=>{
            if(isNotRz()) return
            toggleSingleLogin()
          }
        },
      },
      {
        label: t('security.overview.ipWhitelist'),
        desc: status.value.iptables ? t('security.overview.ipSetDesc') : t('security.overview.ipUnsetDesc'),
        icon:'md-globe',
        tone:'tone-ip',
        loading:false,
        status: status.value.iptables ? t('security.overview.configured') : t('security.overview.notConfigured'),
        showStatus:!status.value.iptables,
        color:status.value.iptables?'success':'error',
        btn:{
          label: status.value.iptables ? t('security.overview.change') : t('security.overview.set'),
          type:status.value.iptables?'default':'primary',
          click:()=>{
            if(isNotRz()) return
            ipWhitelistModalRef.value.open(status.value.iptables)
          }
        },
      },
    ]
  },
  {
    label: t('security.overview.twoFactor'),
    desc: t('security.overview.twoFactorDesc'),
    children:[
      {
        label: t('security.overview.emailVerification'),
        desc: t('security.overview.emailVerificationDesc'),
        icon:'md-mail',
        tone:'tone-email',
        loading:false,
        status: status.value.email_status ? t('security.overview.activated') : t('security.overview.notActivated'),
        showStatus:!status.value.email_status,
        color:status.value.email_status?'success':'error',
        btn:{
          label: status.value.email_status ? t('security.overview.change') : t('security.overview.bind'),
          type:status.value.email_status?'default':'primary',
          click:()=>{
            if(status.value.email_status){
              emailModalRef.value.open(status.value.email)
            }else{
              emailBindingModalRef.value.open(status.value.email)
            }
          }
        },
      },
      {
        label: t('security.overview.googleAuthenticator'),
        desc: t('security.overview.googleDesc'),
        icon:'logo-google',
        tone:'tone-google',
        loading:false,
        status: status.value.google_auth_status ? t('security.overview.activated') : t('security.overview.notActivated'),
        showStatus:!status.value.google_auth_status,
        color:status.value.google_auth_status?'success':'error',
        btn:{
          label: status.value.google_auth_status ? t('security.overview.disable') : t('security.overview.bind'),
          type:status.value.google_auth_status?'default':'primary',
          click:()=>{
            if(!status.value.email_status){
              message(t('security.overview.emailRequired'), 'warning')
              return true
            }
            if(status.value.google_auth_status){
              emailVerificationModalRef.value.open(status.value.email)
            }else{
              googleModalRef.value.open()
            }
          }
        },
      },
    ]
  }
]
})
const setPageLoading = (loading) => {
  if (pageRef.value) pageRef.value.loading = loading
}
const getInfo=()=>{
  setPageLoading(true)
  return getApi('/user/getMySettings').then((res) =>{
    status.value=res
    settingsLoaded.value=true
  }).finally(()=>{
    setPageLoading(false)
  })
}

const openGoogleBindingFromRoute = async () => {
  if (
    route.query.securityAction !== GOOGLE_BINDING_ACTION ||
    !settingsLoaded.value
  ) return

  if(status.value.google_auth_status){
    await removeQuery('securityAction')
    return
  }
  if(!status.value.email_status){
    await removeQuery('securityAction')
    message(t('security.overview.emailRequired'), 'warning')
    return
  }

  await nextTick()
  if(!googleModalRef.value) return

  googleModalRef.value.open()
  await removeQuery('securityAction')
}

watch(
  () => [route.query.securityAction, settingsLoaded.value],
  openGoogleBindingFromRoute,
  { immediate:true }
)

onMounted(()=>{
  getInfo()
})
</script>

<style scoped lang="less">
.security-page{
  color: var(--ui-color-text);
}
.security-hero{
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: var(--ui-padding-16);
  border: var(--ui-border-primary-muted);
  border-radius: var(--ui-radius-sm);
  background:
    linear-gradient(116deg, rgba(43, 92, 217, 0.12) 0%, rgba(43, 92, 217, 0.055) 44%, rgba(255, 255, 255, 0.98) 100%);
  box-shadow: 0 8px 20px rgba(31, 45, 77, 0.04);
  .security-hero-main{
    min-width: 0;
    flex: 1;
  }
  .security-title-row{
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content minmax(220px, 260px);
    align-items: center;
    gap: 18px;
    p{
      margin: 0;
      color: var(--ui-color-neutral-800);
      font-size: 13px;
      line-height: 20px;
    }
  }
  .security-level{
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    white-space: nowrap;
    padding-left: 18px;
    border-left: 1px solid rgba(43, 92, 217, 0.14);
    span{
      display: block;
      color: var(--ui-color-neutral-500);
      font-size: 12px;
      line-height: 16px;
    }
    strong{
      display: block;
      margin-top: 2px;
      color: var(--ui-color-neutral-900);
      font-size: 18px;
      line-height: 24px;
      &.level-low{
        color: var(--ui-color-error-strong);
      }
      &.level-medium{
        color: #f59e0b;
      }
      &.level-high{
        color: #00a870;
      }
    }
  }
  .security-progress{
    padding-left: 18px;
    border-left: 1px solid rgba(43, 92, 217, 0.14);
    .progress-head{
      display: flex;
      align-items: center;
      justify-content: space-between;
      white-space: nowrap;
      color: var(--ui-color-neutral-700);
      font-size: 12px;
      line-height: 16px;
      strong{
        color: var(--primary-color);
        font-size: 14px;
        line-height: 18px;
      }
    }
    :deep(.ivu-progress-inner){
      background: rgba(43, 92, 217, 0.1);
    }
  }
}
.securityBox{
  .securityBox-list{
    border: var(--ui-border-muted);
    border-radius: var(--ui-radius-sm);
    background: #fff;
    overflow: hidden;
    box-shadow: 0 8px 22px rgba(31, 45, 77, 0.035);
    & + .securityBox-list{
      margin-top: 12px;
    }
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
      .securityBox-head-extra{
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        > span{
          color: var(--ui-color-neutral-500);
          font-size: 12px;
        }
      }
      :deep(.head-action){
        height: var(--ui-size-24);
        padding: 0;
        color: var(--primary-color);
      }
    }
    .securityBox-list-tbody{
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
      .securityBox-item{
        position: relative;
        min-height: 76px;
        padding: var(--ui-padding-14-18);
        border-bottom: 1px solid #eef2f7;
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) auto;
        align-items: center;
        column-gap: 14px;
        background: #fff;
        transition: border-color 0.2s ease, background 0.2s ease;
        &:last-child{
          border-bottom: none;
        }
        &:hover{
          background: #fafcff;
          .icon-wrap{
            background: #eef4ff;
            border-color: #cbdcff;
          }
        }
        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--ui-size-40);
          height: var(--ui-size-40);
          background: #f5f8ff;
          color: var(--tone-color, var(--primary-color));
          border: var(--ui-border-primary-subtle);
          border-radius: var(--ui-radius-6);
          flex-shrink: 0;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        &.tone-password,
        &.tone-device,
        &.tone-ip,
        &.tone-email,
        &.tone-google{
          --tone-color: var(--primary-color);
        }
        .left{
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .desc{
          color: var(--ui-color-neutral-800);
          font-size: 13px;
          line-height: 18px;
        }
        .securityBox-item-thead{
          display: flex;
          align-items: center;
          gap: 10px;
          height: var(--ui-size-22);
          line-height: 22px;
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
          justify-self: end;
          align-self: start;
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
  .security-hero{
    padding: var(--ui-padding-14);
    .security-title-row{
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .security-level,
    .security-progress{
      padding-left: 0;
      border-left: none;
    }
  }
  .securityBox{
    .securityBox-list{
      .securityBox-list-head{
        align-items: flex-start;
      }
      .securityBox-list-tbody{
        .securityBox-item{
          min-height: auto;
          padding: var(--ui-padding-16);
          .right{
            justify-self: end;
          }
        }
      }
    }
  }
}
</style>
