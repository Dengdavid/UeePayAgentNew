<template>
  <UiPage isBack :fallback="{ name: 'ucenter_agent_rewards' }">
    <div class="agent-reward-detail">
      <section class="summary-card" :class="{ confirmed: !isPending }">
        <div class="summary-header">
          <div class="header-content">
            <span class="summary-label">{{ $t('agent.rewards.month') }}</span>
            <div class="title-row">
              <h3>{{ detailData.date || '--' }}</h3>
            </div>
          </div>
          <div class="summary-status">
            <UiDot v-model="detailData.status" :options="status" />
          </div>
        </div>
        <div class="summary-metrics">
          <dl class="primary">
            <dt>
              <span>{{ $t('agent.rewards.detailPage.confirmedAmount') }}</span>
              <Tooltip max-width="200" :content="$t('agent.rewards.detailPage.confirmedAmountTip')" placement="top">
                <Icon type="ios-help-circle-outline" />
              </Tooltip>
            </dt>
            <dd>
              <span class="money-symbol">$</span>{{ formatMoneyAmount(detailData.real_amount) }}
            </dd>
            <small>{{ isPending ? $t('agent.rewards.detailPage.pendingCredit') : $t('agent.rewards.detailPage.confirmedCredit') }}</small>
          </dl>
          <dl>
            <dt>{{ $t('agent.rewards.detailPage.totalReward') }}</dt>
            <dd class="amount-value">
              <span class="money-symbol">$</span>{{ formatMoneyAmount(detailData.amount) }}
            </dd>
            <small>{{ $t('agent.rewards.detailPage.monthlySummary') }}</small>
          </dl>
          <dl>
            <dt>
              <span>{{ $t('agent.rewards.detailPage.creditedAmount') }}</span>
            </dt>
            <dd class="posted-value">
              <span class="money-symbol">$</span>{{ formatMoneyAmount(postedAmount) }}
            </dd>
            <small>{{ $t('agent.rewards.detailPage.creditedSiteReward') }}</small>
          </dl>
          <dl>
            <dt>{{ $t('agent.rewards.detailPage.siteCount') }}</dt>
            <dd class="count-value"><strong>{{ table.tbody.length }}</strong> <span class="unit">{{ $t('agent.rewards.detailPage.siteUnit') }}</span></dd>
            <small>{{ $t('agent.rewards.detailPage.expandHint') }}</small>
          </dl>
        </div>
      </section>

      <section class="section-card">
        <div class="section-head">
          <div>
            <h4>{{ $t('agent.rewards.detailPage.composition') }}</h4>
            <p>{{ $t('agent.rewards.detailPage.compositionHint') }}</p>
          </div>
        </div>
        <div class="fee-composition">
          <dl class="fee-primary" :class="{ empty: primaryFee.value === 0 }">
            <dt><span class="source-pill">{{ $t('agent.rewards.detailPage.primarySource') }}</span></dt>
            <dd>
              <span>{{ primaryFee.label }}</span>
              <strong>{{ formatMoney(primaryFee.value) }}</strong>
            </dd>
            <p>{{ $t('agent.rewards.detailPage.compositionPercent', { percent: primaryFee.percent }) }}</p>
          </dl>
          <div class="fee-list">
            <dl v-for="item in secondaryFees" :key="item.key" :class="{ empty: item.value === 0 }">
              <dt>{{ item.label }}</dt>
              <dd>
                <strong>{{ formatMoney(item.value) }}</strong>
                <span>{{ item.percent }}%</span>
              </dd>
            </dl>
          </div>
        </div>
      </section>

      <section class="section-card">
        <div class="section-head">
          <div>
            <h4>{{ $t('agent.rewards.detailPage.siteDetails') }}</h4>
            <p>{{ $t('agent.rewards.detailPage.siteDetailsHint') }}</p>
          </div>
          <div class="section-actions">
            <span class="selected-count">{{ selectedCount ? $t('agent.rewards.detailPage.selectedSites', { count: selectedCount }) : $t('agent.rewards.detailPage.noSiteSelected') }}</span>
            <Dropdown placement="bottom-end" :trigger="selectedCount === 0 ? 'custom' : 'hover'">
              <Button type="default" size="default" :disabled="selectedCount === 0" :loading="selectionsLoading" @click="selectionsShow=!selectionsShow">
                <span>{{ $t('agent.rewards.detailPage.exportData') }}</span>
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <template #list>
                <DropdownMenu>
                    <DropdownItem @click="exportData(2)">{{ $t('agent.rewards.detailPage.dailySummary') }}</DropdownItem>
                    <DropdownItem @click="exportData(1)">{{ $t('agent.rewards.detailPage.monthlyExport') }}</DropdownItem>
                    <DropdownItem @click="exportData(3)">{{ $t('agent.rewards.detailPage.dataDetails') }}</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
          </div>
        </div>
        <FormTable ref="formRef" :table="table" @on-expand="onExpand">
          <template #expand="{ row }">
            <div class="daily-detail-table">
              <FormTable size="small" :loading="sites[row.agent_site_id]?.loading" :table="{
                notPage:true,
                notRefresh:true,
                thead:table.theadMx,
                isSelection:false,
                tbody:sites[row.agent_site_id]?.data || [],
              }" :row-class-name="rowClassName">
              </FormTable>
            </div>
          </template>
        </FormTable>
      </section>

      <div class="reward-action-bar">
        <div class="action-copy">
          <strong>{{ isPending ? $t('agent.rewards.detailPage.waitingConfirmation') : $t('agent.rewards.detailPage.confirmationComplete') }}</strong>
          <span>{{ isPending ? $t('agent.rewards.detailPage.verifyBeforeConfirm') : $t('agent.rewards.detailPage.recordConfirmed') }}</span>
        </div>
        <router-link :to="{
          name:'ucenter_agent_rewards'
        }">
          <Button>{{ $t('agent.rewards.detailPage.close') }}</Button>
        </router-link>
        <Button type="primary" @click="handleConfirm" :loading="buttonLoading" v-if="isPending">{{ $t('agent.rewards.detailPage.confirmReward') }}</Button>
      </div>
    </div>
  </UiPage>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button, Modal } from 'view-ui-plus'
import UiDot from '@/components/uiForm/UiDot/index.vue'
import { message } from '@/utils/message.js'
import { getApi,postApi } from '@/utils/api.js'
import { status } from "./data.js";
import { t } from '@/utils'
const route = useRoute()
const router = useRouter()
const formRef=ref(null)
const detailQuery = computed(() => ({
  id: route.params.id,
}))
// 返回
const goBack = () => {
  router.go(-1)
}
const selectionsShow=ref(false)
const selectionsLoading=ref(false)
const table = reactive ({
    key: 'id',
    tbody: [],
    thead: [
      {
        title: t('agent.rewards.detailPage.siteName'),
        key: 'agent_site_name',
        minWidth: 180,
      },
      {
        title: t('agent.rewards.detailPage.totalRewardUsd'),
        key: 'total_amount',
        align: 'right',
        minWidth: 130,
        sortable: true
      },
      {
        title: t('agent.rewards.detailPage.creditedUsd'),
        key: 'received_amount',
        align: 'right',
        minWidth:130,
        sortable: true
      },
      {
        title: t('agent.rewards.detailPage.pendingUsd'),
        key: 'pending_amount',
        align: 'right',
        minWidth: 130,
        sortable: true,
      },
    ],
    theadMx:[
      {
        title: t('agent.rewards.detailPage.date'),
        key:'time',
        align: 'center',
        width: 120,
      },
      {
        title: `${t('agent.rewards.cardActivationFee')} $`,
        key: 'create_amount',
        align: 'center',
        minWidth: 100,
      },
      {
        title: `${t('agent.rewards.cardTransferInFee')} $`,
        key: 'card_depost_amount',
        align: 'center',
        minWidth: 100,
      },
      {
        title: `${t('agent.rewards.transactionFee')} $`,
        key: 'auth_amount',
        align: 'center',
        minWidth: 100,
      },
      {
        title: `${t('agent.rewards.crossBorderFee')} $`,
        key: 'foreign_amount',
        align: 'center',
        minWidth: 100,
      },
      {
        title: `${t('agent.rewards.accountRechargeFee')} $`,
        key: 'account_depost_amount',
        align: 'center',
        minWidth: 100,
      },
      {
        title: `${t('agent.rewards.membershipFee')} $`,
        key: 'buy_group_amount',
        align: 'center',
        minWidth: 100,
      },
      {
        title: t('agent.rewards.detailPage.invitationCommission'),
        key: 'invite_amount',
        align: 'center',
        minWidth: 100,
      },
    ],
    selections:[],
    search:detailQuery.value,
    searchThead:[],
    notPage:true,
    notRefresh:true,
})
const sites=ref({})
const rowClassName=(row)=>{
  if(row.time === t('agent.rewards.detailPage.monthTotal')){
    return 'total'
  }
  return ''
}
const exportData=(type)=>{
  selectionsLoading.value=true
  selectionsShow.value=false
  postApi('/vcc/InviteCommissionSummary/exportData',{
    agent_site_ids:table.selections?.map(item=>item.agent_site_id) || [],
    date:detailData.value.date,
    type:type,
  })
    .then((res) => {
      message(t('agent.rewards.detailPage.generatingFile'))
    })
    .catch(err=>{
      message(err.msg || err || t('agent.rewards.detailPage.operationFailed'), 'error')
    }).finally(()=>{
      selectionsLoading.value=false
    })
}

const onExpand=(row, status)=>{
  if(!sites.value?.[row.agent_site_id]){
    sites.value[row.agent_site_id]={
      loading:false,
      data:[]
    }
  }
  if(sites.value[row.agent_site_id].data.length>0){
    return
  }
  sites.value[row.agent_site_id].loading=true
  getApi('/vcc/InviteCommissionSummary/siteDailyDetail',{
    agent_site_id:row.agent_site_id,
    date:detailData.value.date,
  })
    .then((res) => {
       const { total=[],daily={}}=res || {}
        const arr=[]
        const defaultObj={
          time: t('agent.rewards.detailPage.monthTotal'),
          //卡片激活费
          create_amount:0,
          create_amount_status:0,
          create_amount_received_amount:0,
          create_amount_pending_amount:0,
          //账户充值费
          account_depost_amount:0,
          account_depost_amount_status:0,
          account_depost_amount_received_amount:0,
          account_depost_amount_pending_amount:0,
          //卡片转入费
          card_depost_amount:0,
          card_depost_amount_status:0,
          card_depost_amount_received_amount:0,
          card_depost_amount_pending_amount:0,
          //交易手续费
          auth_amount:0,
          auth_amount_status:0,
          auth_amount_received_amount:0,
          auth_amount_pending_amount:0,
          //跨境手续费
          foreign_amount:0,
          foreign_amount_status:0,
          foreign_amount_received_amount:0,
          foreign_amount_pending_amount:0,
          //会员服务费
          buy_group_amount:0,
          buy_group_amount_status:0,
          buy_group_amount_received_amount:0,
          buy_group_amount_pending_amount:0,
          //邀请返佣
          invite_amount:0,
          invite_amount_status:0,
          invite_amount_received_amount:0,
          invite_amount_pending_amount:0,
        }
        const totalObj={
          ...defaultObj,
          style:{
            'font-weight': 'bold',
            color:'var(--ui-color-error-strong)'
          }
        }
        total.forEach(item => {
          totalObj[`${item.type}`]=Number(item.amount ?? 0)
          totalObj[`${item.type}_status`]=null
          totalObj[`${item.type}_received_amount`]=Number(item.received_amount ?? 0)
          totalObj[`${item.type}_pending_amount`]=Number(item.pending_amount ?? 0)
        });
        arr.push(totalObj)
        //循环对象
        Object.entries(daily).forEach(([time, list]) => {
          const obj={
            ...defaultObj,
            time,
          }
          list.forEach(item => {
            obj[`${item.type}`]=Number(item.amount ?? 0)
            obj[`${item.type}_status`]=item.status ?? 0
            obj[`${item.type}_received_amount`]=Number(item.received_amount ?? 0)
            obj[`${item.type}_pending_amount`]=Number(item.pending_amount ?? 0)
          });
          arr.push(obj)
        })
        sites.value[row.agent_site_id].data=arr
    })
    .catch(err=>{
      message(err.msg || err || t('agent.rewards.detailPage.operationFailed'), 'error')
    })
    .finally(()=>{
      sites.value[row.agent_site_id].loading=false
    })
}
const detailData=ref({})
const isPending = computed(() => Number(detailData.value?.status) === 0)
const selectedCount = computed(() => table.selections?.length || 0)
const toNumber = (value) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}
const postedAmount = computed(() => Math.max(toNumber(detailData.value?.amount) - toNumber(detailData.value?.real_amount), 0))
const rewardAmountItems = [
  {
    label: t('agent.rewards.accountRechargeFee'),
    key: 'account_depost_amount',
  },
  {
    label: t('agent.rewards.cardActivationFee'),
    key: 'create_amount',
  },
  {
    label: t('agent.rewards.cardTransferInFee'),
    key: 'card_depost_amount',
  },
  {
    label: t('agent.rewards.transactionFee'),
    key: 'auth_amount',
  },
  {
    label: t('agent.rewards.crossBorderFee'),
    key: 'foreign_amount',
  },
  {
    label: t('agent.rewards.membershipFee'),
    key: 'buy_group_amount',
  },
]
const feeTotal = computed(() => rewardAmountItems.reduce((sum, item) => sum + feeValue(item.key), 0))
const feeItems = computed(() => rewardAmountItems
  .map(item => {
    const value = feeValue(item.key)
    const percent = feeTotal.value ? Math.round((value / feeTotal.value) * 100) : 0
    return {
      ...item,
      value,
      percent,
    }
  }))
const emptyFeeItem = {
  label: '--',
  key: '',
  value: 0,
  percent: 0,
}
const primaryFee = computed(() => feeItems.value.reduce((maxItem, item) => {
  if (!maxItem || item.value > maxItem.value) {
    return item
  }
  return maxItem
}, null) || emptyFeeItem)
const secondaryFees = computed(() => feeItems.value)
const buttonLoading=ref(false)
const formatMoney = (value) => {
  return `$${formatMoneyAmount(value)}`
}
const formatMoneyAmount = (value) => {
  const number = toNumber(value)
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
const feeValue = (key) => toNumber(detailData.value?.[key])
// 确认返现
const handleConfirm = () => {
  Modal.confirm({
    title: t('agent.rewards.detailPage.confirmTitle'),
    content: t('agent.rewards.detailPage.confirmContent'),
    onOk: async () => {
        buttonLoading.value=true
        postApi('/vcc/InviteCommissionSummary/confirm',{
          id: detailQuery.value.id
        }).then((res) => {
          message(t('agent.rewards.detailPage.confirmSuccess'))
          goBack()
        }).catch((err)=>{
          message(err?.msg || err || t('agent.rewards.detailPage.operationFailed'), 'error')
        }).finally(() => {
          buttonLoading.value=false
        });
    },
  })
}
const getData=()=>{
   const _query = detailQuery.value
   if (!_query?.id) {
    message(t('agent.rewards.detailPage.missingRecord'), 'error')
    goBack()
    return
  }
  table.loading=true
  getApi('/vcc/InviteCommissionSummary/detail',_query)
    .then((res) => {
      table.tbody = (res?.sites || []).map((el)=>{
        const {details,...rest}=el
        const row={
          ...rest
        }
        details.forEach((item)=>{
          row[item.type]=item.amount ?? 0
          row[`${item.type}_pending_amount`]=item.pending_amount ?? 0
          row[`${item.type}_received_amount`]=item.received_amount ?? 0
        })
        return row
      }) || []
      detailData.value = res?.summary || {}
    })
    .catch((err)=>{
      message(err, 'error')
    })
    .finally(() => {
      table.loading=false
    });
}
onMounted(() => {
  getData()
})
</script>

<style scoped lang="less">
.agent-reward-detail {
  display: grid;
  gap: 16px;

  .summary-card {
    position: relative;
    overflow: hidden;
    border-radius: var(--ui-radius-lg);
    background: linear-gradient(180deg, #e8eefb 0%, #fff 60%);
    display: flex;
    flex-direction: column;

    &.confirmed {
      .summary-metrics .primary dd {
        color: var(--ui-color-text);
      }
    }
  }

  .summary-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px 8px;

    .summary-label {
      display: block;
      color: var(--ui-color-text-muted);
      font-size: 12px;
      margin-bottom: 6px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;

      h3 {
        margin: 0;
        color: var(--ui-color-text);
        font-size: 22px;
        font-weight: 700;
        line-height: 1.15;
      }
    }
  }

  .summary-status {
    flex-shrink: 0;
    padding-top: 22px;
  }

  .summary-metrics {
    display: grid;
    grid-template-columns: minmax(200px, 1.25fr) repeat(3, minmax(130px, 1fr));
    margin: 0 18px 14px;
    padding: var(--ui-padding-14-16);
    gap: 24px;
    border-radius: var(--ui-radius-6);
    background: #fff;
    box-shadow:
      0 1px 2px rgba(25, 27, 31, 0.025),
      0 6px 16px rgba(43, 92, 217, 0.045);

    dl {
      margin: 0;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: -12px;
        top: 10%;
        bottom: 10%;
        width: var(--ui-size-1);
        background: #f0f2f5;
      }

      &.primary {
        dd {
          font-size: 28px;
          color: var(--ui-color-primary);

          .money-symbol {
            font-size: 16px;
          }
        }
      }
    }

    dt {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      color: var(--ui-color-text-muted);
      font-size: 12px;

      .ivu-icon {
        font-size: 14px;
        cursor: help;
      }
    }

    dd {
      margin: 0;
      color: var(--ui-color-text);
      font-size: 20px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;

      .money-symbol {
        display: inline-block;
        margin-right: 2px;
        color: currentColor;
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        vertical-align: baseline;
      }

      .unit {
        display: inline-block;
        font-size: 12px;
        font-weight: normal;
        color: var(--ui-color-text-muted);
        margin-left: 2px;
        vertical-align: baseline;
      }
    }

    small {
      display: block;
      margin-top: 8px;
      color: #a0aec0;
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .section-card {
    padding: var(--ui-padding-0-4);
  }

  .section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;

    h4 {
      margin: var(--ui-margin-0-0-4);
      color: var(--ui-color-text);
      font-size: 15px;
      font-weight: 700;
    }

    p {
      margin: 0;
      color: var(--ui-color-text-muted);
      font-size: 12px;
      line-height: 1.5;
    }
  }

  .section-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .selected-count {
    color: var(--ui-color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }

  .fee-composition {
    display: grid;
    grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
    gap: 12px;
    padding: var(--ui-padding-12);
    border-radius: var(--ui-radius-6);
    background: #f7f9fc;
  }

  .fee-primary {
    min-width: 0;
    margin: 0;
    padding: var(--ui-padding-14);
    border-radius: var(--ui-radius-md);
    background: #fff;

    dt {
      margin-bottom: 12px;
    }

    .source-pill {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: var(--ui-padding-3-10);
      border-radius: var(--ui-radius-full);
      background: #eef3ff;
      color: var(--ui-color-primary);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
    }

    dd {
      display: grid;
      gap: 6px;
      margin: 0;
      font-variant-numeric: tabular-nums;

      span {
        color: var(--ui-color-neutral-800);
        font-size: 13px;
      }

      strong {
        color: var(--ui-color-text);
        font-size: 24px;
        font-weight: 700;
        line-height: 1.1;
      }
    }

    p {
      margin: var(--ui-margin-12-0-0);
      color: var(--ui-color-text-muted);
      font-size: 12px;
      line-height: 1.5;
    }

    &.empty {
      opacity: 0.62;
    }
  }

  .fee-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px 18px;
    min-width: 0;
    align-content: start;

    dl {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 8px 0;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: var(--ui-size-1);
        background: rgba(132, 145, 165, 0.12);
      }

      &.empty {
        opacity: 0.58;
      }
    }

    dt {
      min-width: 0;
      overflow: hidden;
      color: var(--ui-color-text-muted);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    dd {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      margin: 0;
      color: var(--ui-color-text);
      font-variant-numeric: tabular-nums;

      strong {
        font-size: 15px;
        font-weight: 700;
      }

      span {
        min-width: 42px;
        color: var(--ui-color-text-muted);
        font-size: 12px;
        font-weight: 500;
        text-align: right;
      }
    }
  }

  .daily-detail-table {
    margin: 8px 0 8px 40px;
    padding: var(--ui-padding-8);
    border-radius: var(--ui-radius-md);
    background: #f7f9fc;
  }

  .reward-action-bar {
    position: sticky;
    bottom: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: var(--ui-padding-12-16);
    border-radius: var(--ui-radius-6);
    background: #fff;
    box-shadow: 0 -8px 24px rgba(25, 27, 31, 0.06);
  }

  .action-copy {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 2px;

    strong {
      color: var(--ui-color-text);
      font-size: 14px;
      font-weight: 600;
    }

    span {
      color: var(--ui-color-text-muted);
      font-size: 12px;
      line-height: 1.5;
    }
  }

  :deep(.form-table-body .ivu-table-cell) {
    padding-left: 12px;
    padding-right: 12px;
  }

  :deep(.ivu-table-wrapper) {
    border-color: transparent;
    border-radius: var(--ui-radius-md);
    overflow: hidden;
  }

  :deep(.ivu-table th) {
    background: #f7f9fc;
    color: var(--ui-color-neutral-800);
    font-weight: 600;
  }

  :deep(.total) {
    color: var(--ui-color-error-strong);
    font-weight: 700;
  }
}

@media (max-width: 768px) {
  .agent-reward-detail {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 0;

    .section-head {
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }

    .summary-card {
      border-radius: var(--ui-radius-6);
      background: linear-gradient(180deg, #edf3ff 0%, #fff 52%);
    }

    .summary-header {
      align-items: flex-start;
      flex-direction: row;
      padding: 12px 12px 10px;

      .summary-label {
        margin-bottom: 4px;
      }

      .title-row h3 {
        font-size: 20px;
      }
    }

    .summary-status {
      padding-top: 20px;
    }

    .section-actions {
      width: 100%;
      align-items: stretch;
      flex-direction: column;

      .ivu-btn {
        width: 100%;
        min-height: 44px;
      }
    }

    .selected-count {
      white-space: normal;
    }

    .fee-composition,
    .fee-list {
      grid-template-columns: 1fr;
    }

    .section-card {
      padding: 0;
    }

    .summary-metrics {
      display: flex;
      flex-direction: column;
      margin: 0 12px 12px;
      padding: var(--ui-padding-4-12);
      box-shadow:
        0 1px 2px rgba(25, 27, 31, 0.02),
        0 4px 12px rgba(43, 92, 217, 0.04);

      dl {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas:
          "label value"
          "note value";
        align-items: center;
        column-gap: 12px;
        row-gap: 4px;
        min-width: 0;
        padding: var(--ui-padding-12-0);
        justify-content: initial;

        &::after {
          display: none;
        }

        &:not(:first-child) {
          border-top: 1px solid rgba(132, 145, 165, 0.12);
        }

        &.primary {
          padding-top: 10px;
          padding-bottom: 12px;

          dd {
            font-size: 26px;
          }
        }
      }

      dt {
        grid-area: label;
        margin: 0;
        align-self: end;
      }

      dd {
        grid-area: value;
        align-self: center;
        font-size: 18px;
        text-align: right;
      }

      small {
        grid-area: note;
        margin-top: 0;
      }
    }

    .fee-composition {
      padding: 0;
      gap: 8px;
      background: transparent;
    }

    .fee-primary {
      padding: var(--ui-padding-12);
      box-shadow:
        0 1px 2px rgba(25, 27, 31, 0.02),
        0 4px 12px rgba(43, 92, 217, 0.035);

      dt {
        margin-bottom: 10px;
      }
    }

    .fee-list {
      gap: 8px;

      dl {
        gap: 8px;
        padding: var(--ui-padding-12);
        border-radius: var(--ui-radius-md);
        background: #fff;
        box-shadow: 0 1px 2px rgba(25, 27, 31, 0.025);

        &::after {
          display: none;
        }
      }
    }

    .daily-detail-table {
      margin-left: 0;
      padding: var(--ui-padding-6);
      overflow-x: auto;
    }

    :deep(.ivu-table-wrapper) {
      overflow-x: auto;
    }

    .reward-action-bar {
      position: static;
      align-items: stretch;
      flex-direction: column;
      gap: 8px;
      padding: var(--ui-padding-12);
      border-top: 1px solid rgba(132, 145, 165, 0.12);
      border-radius: var(--ui-radius-6);
      box-shadow: none;

      a {
        width: 100%;
      }

      .ivu-btn {
        width: 100%;
        min-height: 44px;
      }
    }
  }
}

@media (max-width: 480px) {
  .agent-reward-detail {
    .summary-metrics {
      dl {
        grid-template-columns: minmax(0, 1fr) max-content;
      }

      dd {
        max-width: 46vw;
        overflow-wrap: anywhere;
      }
    }

    .section-head h4 {
      font-size: 14px;
    }

    .fee-primary dd strong {
      font-size: 22px;
    }

    .fee-list {
      dd {
        gap: 6px;

        strong {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
