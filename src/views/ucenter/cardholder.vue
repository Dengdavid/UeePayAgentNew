<template>
  <div class="cardholder-page">
    <CardBox title-style="line" :title="$t('card.index.cardholder.management')">
      <SuperTable
        ref="tableRef"
        path="/vcc/getCardholders"
        :columns="columns"
        :params="filterForm"
        :border="false"
        :refresh="false"
      >
        <template #header-left>
          <div class="ui-inline-form mb-20">
            <Input
              v-model="filterForm.first_name"
              :placeholder="$t('card.index.cardholder.firstName')"
              clearable
              style="width: 120px"
              @on-enter="handleReload"
            />
            <Input
              v-model="filterForm.last_name"
              :placeholder="$t('card.index.cardholder.lastName')"
              clearable
              style="width: 120px"
              @on-enter="handleReload"
            />
            <Input
              v-model="filterForm.email"
              :placeholder="$t('card.index.cardholder.email')"
              clearable
              style="width: 150px"
              @on-enter="handleReload"
            />
            <Input
              v-model="filterForm.phone_number"
              :placeholder="$t('card.index.cardholder.phone')"
              clearable
              style="width: 120px"
              @on-enter="handleReload"
            />
            <Select
              v-model="filterForm.status"
              :placeholder="$t('card.index.cardholder.allStatuses')"
              clearable
              style="width: 120px"
              @on-change="handleReload"
            >
              <Option value="Active">{{ $t('card.index.cardholder.statuses.active') }}</Option>
              <Option value="Pending">{{ $t('card.index.cardholder.statuses.pending') }}</Option>
              <Option value="Inactive">{{ $t('card.index.cardholder.statuses.inactive') }}</Option>
              <Option value="PendingCheck">{{ $t('card.index.cardholder.statuses.pendingCheck') }}</Option>
            </Select>
          </div>
        </template>

        <template #header-right>
          <Button @click="handleReload" class="mr-10"
            ><Icon type="md-refresh" :size="16" /><span class="mr-5"
              >{{ $t('card.index.cardholder.refresh') }}</span
            ></Button
          >
          <div class="ui-inline-form mb-20">
            <Button type="primary" @click="handleShowCardholderDrawer">
              <Icon type="md-add" style="margin-right: 8px" />
              {{ $t('card.index.cardholder.create') }}
            </Button>
          </div>
        </template>

        <template #phoneCountryCode="{ row }">
          +{{ row.phone_country_code }}
        </template>

        <template #status="{ row }">
          <div class="ui-flex ui-flex-align-center">
            <DotText :color="statusColors[row.status]">{{
              statusTexts[row.status]
            }}</DotText>
            <Tooltip
              v-if="row.status === 'Inactive' && row.remark"
              :content="row.remark"
            >
              <Icon
                custom="iconfont icon-question"
                color="#9e9e9e"
                class="ui-pointer ml-5"
              />
            </Tooltip>
          </div>
        </template>

        <template #action="{ row }">
          <div>
            <TextButton type="default" @click="handleView(row)"
              >{{ $t('card.index.cardholder.detail') }}</TextButton
            >
          </div>
        </template>
      </SuperTable>
    </CardBox>

    <!-- 创建持卡人抽屉 -->
    <FixedDrawer
      v-model="showCardholderDrawer"
      :title="$t('card.index.cardholder.create')"
      :width="600"
      :closable="!cardholderRef?.submiting"
      :mask-closable="false"
    >
      <CardHolder
        ref="cardholderRef"
        @on-success="handleCardholderSuccess"
        @on-error="handleCardholderError"
      />

      <template #footer>
        <div class="ui-flex ui-flex-align-center">
          <Button
            type="primary"
            :loading="cardholderRef?.submiting"
            style="min-width: 100px"
            @click="handleSubmitCardholder"
            >{{ cardholderRef?.submiting ? $t('card.index.cardholder.submitting') : $t('card.index.cardholder.submit') }}</Button
          >
          <Button
            :disabled="cardholderRef?.submiting"
            class="ml-10"
            style="min-width: 100px"
            @click="handleCloseCardholder"
            >{{ $t('card.index.cardholder.close') }}</Button
          >

          <!-- 错误信息显示在关闭按钮旁边 -->
          <div
            v-if="cardholderErrorMsg"
            class="ui-text-red ml-20"
            style="font-size: 13px"
          >
            {{ cardholderErrorMsg }}
          </div>
        </div>
      </template>
    </FixedDrawer>

    <!-- 查看持卡人详情抽屉 -->
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import SuperTable from '@/components/layout/SuperTable.vue'
import DotText from '@/components/ui/dot-text.vue'
import TextButton from '@/components/ui/text-button.vue'
import FixedDrawer from '@/components/layout/FixedDrawer.vue'
import CardHolder from '@/views/card/components/CardHolder.vue'
import { cardApi } from '@/api'
import { Modal } from 'view-ui-plus'
import { useUserStore } from '@/store/user.js'
import { storeToRefs } from 'pinia'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
import { toRoute } from '@/utils/route.js'

const tableRef = ref()
const showCardholderDrawer = ref(false)
const cardholderRef = ref()
const cardholderErrorMsg = ref('') // 新增错误信息状态
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const filterForm = ref({
  status: '',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
})

const columns = ref([
  {
    title: t('card.index.cardholder.createdAt'),
    width: 165,
    key: 'created_at',
  },
  {
    title: t('card.index.cardholder.firstName'),
    width: 140,
    key: 'first_name',
  },
  {
    title: t('card.index.cardholder.lastName'),
    width: 140,
    key: 'last_name',
  },
  {
    title: t('card.index.cardholder.phoneCountryCode'),
    width: 90,
    slot: 'phoneCountryCode',
  },
  {
    title: t('card.index.cardholder.phone'),
    width: 130,
    key: 'phone_number',
  },
  {
    title: t('card.index.cardholder.email'),
    width: 180,
    key: 'email',
  },
  {
    title: t('card.index.cardholder.status'),
    width: 133,
    slot: 'status',
  },
])

const statusTexts = {
  Active: t('card.index.cardholder.statuses.active'),
  Pending: t('card.index.cardholder.statuses.pending'),
  Inactive: t('card.index.cardholder.statuses.inactive'),
  PendingCheck: t('card.index.cardholder.statuses.pendingCheck'),
}

const statusColors = {
  Active: 'var(--ui-color-success)', // 绿色 - 已激活成功
  Pending: 'var(--ui-color-primary)', // 蓝色 - 审核中
  Inactive: 'var(--ui-color-error)', // 红色 - 拒绝
  PendingCheck: 'var(--ui-color-warning)', // 橙色 - 待补充
}

const showCardholderDetailDrawer = ref(false)
const cardholderDetail = ref(null)
const loadingDetail = ref(false)

const handleReload = async function () {
  await nextTick()
  tableRef.value && tableRef.value.init()
}

const handleSubmitCardholder = async () => {
  try {
    await cardholderRef.value.submit()
  } catch (err) {
    // 错误已经在组件内部处理了
  }
}

const handleCloseCardholder = () => {
  showCardholderDrawer.value = false
  // 清空错误信息
  cardholderErrorMsg.value = ''
  cardholderRef.value?.resetForm()
}

const handleCardholderSuccess = () => {
  // 清空错误信息
  cardholderErrorMsg.value = ''
  showCardholderDrawer.value = false
  tableRef.value?.reload()
}

const handleCardholderError = (err) => {
  // 设置错误信息到状态中
  cardholderErrorMsg.value = err.msg || err.message || t('card.index.cardholder.createFailed')
}

const handleView = async (row) => {
  try {
    loadingDetail.value = true
    showCardholderDetailDrawer.value = true
    const res = await cardApi.getCardholderDetail({ id: row.id })
    cardholderDetail.value = res
  } catch (err) {
    message(err.msg || t('card.index.cardholder.detailFailed'), 'error')
    showCardholderDetailDrawer.value = false
  } finally {
    loadingDetail.value = false
  }
}

// 处理显示持卡人抽屉 - 添加实名认证检查
const handleShowCardholderDrawer = () => {
  // 检查实名认证状态
  if (user.value.auth_status !== 1) {
    Modal.confirm({
      title: t('card.index.cardholder.verificationTitle'),
      content: t('card.index.cardholder.verificationContent'),
      okText: t('card.index.cardholder.verifyNow'),
      cancelText: t('card.index.cardholder.cancel'),
      onOk: () => {
        toRoute('certify')
      },
    })
    return
  }

  // 实名认证通过，显示抽屉
  showCardholderDrawer.value = true
}
</script>

<style lang="less" scoped>
.cardholder-page {
  .mb-20 {
    margin-bottom: 20px;
  }
}

.detail-section {
  margin-bottom: 24px;

  h4 {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--ui-color-text);
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 8px;
  }
}

.detail-item {
  display: flex;
  margin-bottom: 12px;

  .label {
    width: var(--ui-size-100);
    color: var(--ui-color-text-subtle);
    flex-shrink: 0;
  }
}
</style>
