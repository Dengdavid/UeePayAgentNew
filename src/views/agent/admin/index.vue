<template>
  <UiPage>
    <Alert type="warning" class="admin-tip">
      {{ $t('agent.admin.warning') }}
    </Alert>
    <div class="adminBox">
      <div class="adminBox-header">
        <div class="adminBox-search">
          <FormInput
            v-model="table.keyword"
            :placeholder="$t('agent.admin.searchPlaceholder')"
            :search="true"
            width="100%"
            @on-change="set_tbody"
          />
          <Button v-if="table.keyword" type="text" @click="clearKeyword">{{ $t('agent.admin.clear') }}</Button>
        </div>
        <Button type="primary" icon="md-add" @click="addAdmin">{{ $t('agent.admin.add') }}</Button>
      </div>

      <Spin v-if="table.loading" fix />

      <template v-if="c_tbody?.length > 0">
        <div class="admin-item" v-for="value in c_tbody" :key="value.admin_uid">
          <div
            class="admin-item-head"
            role="button"
            tabindex="0"
            @click="toggleAdmin(value)"
            @keydown.enter="toggleAdmin(value)"
          >
            <div class="admin-title">
              <span class="admin-avatar">
                <Icon custom="iconfont icon-CRMEB-fenxiaoyuan-mianxing" />
              </span>
              <div>
                <h4>{{ value.label || '-' }}</h4>
              </div>
            </div>
            <div class="admin-head-actions">
              <span class="admin-count">{{ $t('agent.admin.siteCount', { count: value.children.length }) }}</span>
              <span class="admin-arrow">
                <Icon :type="value.hide ? 'ios-arrow-down' : 'ios-arrow-up'" />
              </span>
            </div>
          </div>
          <div class="admin-item-body" v-show="!value.hide">
            <div class="site-list">
              <div class="site-row" v-for="item in value.children" :key="item.id">
                <div class="site-main">
                  <h4>{{ item.site_name || '-' }}</h4>
                </div>
                <div class="site-meta">
                  <span>
                    <em>{{ $t('agent.admin.domain') }}</em>
                    {{ item.site_domain || '-' }}
                  </span>
                  <span>
                    <em>{{ $t('agent.admin.createdAt') }}</em>
                    {{ item.created_at || '-' }}
                  </span>
                </div>
                <div class="site-actions">
                  <FormSwitch
                    size="small"
                    v-model="item.status"
                    :disabled="item.is_super || item._status_loading"
                    @on-change="changeStatus(item)"
                  />
                  <Button type="error" ghost size="small" @click="delAdmin(item)">{{ $t('agent.admin.remove') }}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="admin-empty">
          <Icon type="md-people" />
          <h4>{{ table.keyword ? $t('agent.admin.noMatch') : $t('agent.admin.empty') }}</h4>
          <p>{{ table.keyword ? $t('agent.admin.noMatchHint') : $t('agent.admin.emptyHint') }}</p>
          <Button v-if="table.keyword" type="primary" ghost @click="clearKeyword">{{ $t('agent.admin.clearFilter') }}</Button>
        </div>
      </template>
    </div>
    <AdminModal ref="adminModalRef" @success="getInfo" />
  </UiPage>
</template>

<script setup>
import { ref,reactive,onMounted} from 'vue'
import { getApi,postApi } from '@/utils/api.js'
import { Button, Modal } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import AdminModal from './components/AdminModal.vue'
import { t } from '@/utils'

const adminModalRef=ref(null)
const delAdmin=(row)=>{
  Modal.confirm({
    title: t('agent.admin.promptTitle'),
    content: t('agent.admin.removeConfirm', { name: row.nickname }),
    onOk:() => {
      postApi('/user/agentSite/delAdmin',{
        data:[
          {
            agent_site_id:row.agent_site_id,
            admin_uid:row.admin_uid
          }
        ]
      }).then((res) => {
        message(t('agent.admin.removeSuccess'))
        getInfo()
      }).catch((err)=>{
        message(err?.msg || err, 'error')
      }).finally(() => {
      });
    },
  })
}
const changeStatus=(row)=>{
  const previousStatus = row.status ? 0 : 1
  row._status_loading=true
  postApi('/user/agentSite/changeStatus',{
    status:row.status,
    data:[
      {
        agent_site_id:row.agent_site_id,
        admin_uid:row.admin_uid
      }
    ]
  }).then((res) => {
    message(t('agent.admin.operationSuccess'))
    getInfo()
  }).catch((err)=>{
    row.status = previousStatus
    message(err.msg || t('agent.admin.operationFailed'), 'error')
  }).finally(() => {
    row._status_loading=false
  });
}
const addAdmin=()=>{
  adminModalRef.value?.open()
}
const table = reactive ({
    keyword:'',
    tbody:[],
    loading:false,
})
const c_tbody=ref([])
const set_tbody=()=>{
  c_tbody.value=[]
  const keyword = table.keyword?.trim()?.toLowerCase()
  const tbodyArr=JSON.parse(JSON.stringify(table.tbody))?.filter((item)=>{
    if(!keyword) return true
    return item.site_name?.toLowerCase()?.includes(keyword) || item.site_domain?.toLowerCase()?.includes(keyword) || item.nickname?.toLowerCase()?.includes(keyword)
  }) || []
  tbodyArr.forEach(item => {
    const adminIndex=c_tbody.value.findIndex((el)=>el.admin_uid==item.admin_uid)
    if(adminIndex>-1){
      c_tbody.value[adminIndex].children.push(item)
    }else{
      c_tbody.value.push({
        label:item.nickname,
        admin_uid:item.admin_uid,
        hide:false,
        children:[item]
      })
    }
  });
}
const clearKeyword = () => {
  table.keyword = ''
  set_tbody()
}
const toggleAdmin = (row) => {
  row.hide = !row.hide
}
const getInfo=()=>{
  table.loading=true
  getApi('/user/agentSite/lists').then((res) => {
    table.tbody=res?.map((item)=>({
        ...item,
        ...item.agentSite,
        _status_loading:false,
    })) || []
    set_tbody()
  }).catch((err)=>{
    message(err, 'error')
  }).finally(() => {
    table.loading=false
  });
}
onMounted(() => {
  getInfo()
})
</script>

<style scoped lang="less">
.admin-tip{
  margin-bottom: 12px;
}

.adminBox{
  position: relative;
  color: var(--ui-color-text);

  .adminBox-header{
    display: flex;
    justify-content:space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .adminBox-search{
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
    min-width: 0;
    max-width: 480px;
  }

  .admin-item{
    border: var(--ui-border-subtle);
    border-radius: var(--ui-radius-6);
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(18, 32, 66, 0.04);
    background:#f7faff;
    .admin-item-head{
      position: relative;
      min-height: 44px;
      padding: var(--ui-padding-6-12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      cursor: pointer;
      transition: background-color .2s ease;



      &:focus-visible{
        outline: 2px solid rgba(43, 92, 217, 0.35);
        outline-offset: -2px;
      }
    }

    .admin-title{
      display: flex;
      align-items: center;
      flex: 1;
      gap: 8px;
      min-width: 0;

      > div{
        min-width: 0;
      }

      h4{
        margin: 0;
        overflow: hidden;
        color: var(--ui-color-text);
        font-size: 15px;
        line-height: 20px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .admin-avatar{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 28px;
      width: var(--ui-size-28);
      height: var(--ui-size-28);
      border-radius: var(--ui-radius-6);
      border: var(--ui-border-primary-soft);
      background: linear-gradient(180deg, #3f72ed 0%, var(--ui-color-primary) 100%);
      box-shadow: 0 6px 14px rgba(43, 92, 217, 0.18);
      color: var(--ui-color-text-inverse);
      font-size: 16px;

      :deep(.ivu-icon),
      :deep(.iconfont){
        line-height: 1;
      }
    }

    .admin-head-actions{
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      flex: 0 0 auto;
      color: var(--ui-color-text-muted);
    }

    .admin-count{
      display: inline-flex;
      align-items: center;
      height: var(--ui-size-24);
      padding: var(--ui-padding-0-10);
      border: var(--ui-border-primary-soft);
      border-radius: var(--ui-radius-full);
      background: #fff;
      box-shadow: 0 2px 8px rgba(43, 92, 217, 0.06);
      color: var(--primary-color);
      font-size: 12px;
      line-height: 22px;
      font-weight: 500;
      white-space: nowrap;
    }

    .admin-arrow{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--ui-size-24);
      height: var(--ui-size-24);
      border: 1px solid #e3e8f2;
      border-radius: var(--ui-radius-circle);
      background: #fff;
      color: var(--ui-color-neutral-700);
      transition: border-color .2s ease, color .2s ease, background-color .2s ease;
    }

    .admin-item-head:hover .admin-arrow{
      border-color: rgba(43, 92, 217, 0.26);
      background: #f5f8ff;
      color: var(--primary-color);
    }

    .admin-item-body{
      padding: 8px 12px 12px;

      .site-list{
        background: #fff;
        border: var(--ui-border-subtle);
        border-radius: var(--ui-radius-6);
        overflow: hidden;
      }

      .site-row{
        display: grid;
        grid-template-columns: minmax(180px, 1.1fr) minmax(280px, 2fr) auto;
        align-items: center;
        gap: 14px;
        min-height: 58px;
        padding: var(--ui-padding-10-12);
        border-bottom: 1px solid #edf0f5;
        transition: background-color .2s ease;

        &:last-child{
          border-bottom: 0;
        }

        &:hover{
          background: #fbfcff;
        }
      }

      .site-main{
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;

        h4{
          margin: 0;
          color: var(--ui-color-text);
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
          word-break: break-word;
        }
      }

      .site-meta{
        display: grid;
        grid-template-columns: minmax(160px, 1fr) minmax(160px, .9fr);
        gap: 8px 18px;
        min-width: 0;
        color: var(--ui-color-text);
        font-size: 13px;
        line-height: 20px;

        span{
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        em{
          margin-right: 8px;
          color: var(--ui-color-text-muted);
          font-style: normal;
        }
      }

      .site-actions{
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        min-width: 112px;
      }
    }
  }

  .admin-empty{
    min-height: 220px;
    padding: 42px 16px;
    border: 1px dashed #dbe2ef;
    border-radius: var(--ui-radius-6);
    background: #fff;
    text-align: center;

    .ivu-icon{
      color: #9aa7bd;
      font-size: 34px;
    }

    h4{
      margin: 12px 0 6px;
      color: var(--ui-color-text);
      font-size: 15px;
      line-height: 22px;
      font-weight: 600;
    }

    p{
      margin: var(--ui-margin-0-0-14);
      color: var(--ui-color-neutral-700);
      font-size: 13px;
      line-height: 20px;
    }
  }
}

@media screen and (max-width: 1024px) {
  .adminBox{
    .admin-item .admin-item-body{
      .site-row{
        grid-template-columns: minmax(160px, .9fr) minmax(220px, 1.4fr) auto;
      }

      .site-meta{
        grid-template-columns: 1fr;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .adminBox{
    .adminBox-header{
      align-items: stretch;
      flex-direction: column;
    }

    .adminBox-search{
      width: 100%;
      max-width: none;
    }

    .admin-item .admin-item-head{
      min-height: 42px;
    }

    .admin-item .admin-item-body{
      padding: var(--ui-padding-8);

      .site-row{
        grid-template-columns: 1fr;
        gap: 8px;
        min-height: 0;
        padding: var(--ui-padding-12);
      }

      .site-meta{
        grid-template-columns: 1fr;
      }

      .site-actions{
        justify-content: space-between;
        width: 100%;
        min-width: 0;
      }
    }
  }
}

@media screen and (max-width: 420px) {
  .adminBox{
    .adminBox-search{
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .admin-item .admin-item-head{
      align-items: flex-start;
    }

    .admin-item .admin-item-body{
      .site-main{
        align-items: flex-start;
        flex-direction: column;
      }

      .site-meta span{
        white-space: normal;
      }
    }
  }
}
</style>
