<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
      <div class="message-set-box">
        <p class="message-set-description">{{ $t('notificationSettings.description') }}</p>

        <div class="message-set-list">
          <section class="message-set-item">
              <div class="message-set-header">
                <div class="message-set-heading">
                  <div class="message-set-title">
                    <b>{{ $t('notificationSettings.insufficientBalance') }}</b>
                  </div>
                  <p>{{ $t('notificationSettings.insufficientBalanceDesc') }}</p>
                </div>
                <div class="message-set-toggle">
                  <span>{{ form.data.card_available_notification.status ? $t('notificationSettings.enabled') : $t('notificationSettings.disabled') }}</span>
                  <FormSwitch
                    v-model="form.data.card_available_notification.status"
                    :trueValue="1"
                    :falseValue="0"
                    :aria-label="$t('notificationSettings.insufficientBalance')"
                  />
                </div>
              </div>

              <div v-if="form.data.card_available_notification.status" class="message-set-fields message-set-fields--balance">
                  <FormItemBox :label="$t('notificationSettings.method')" prop="data.card_available_notification.select" isRequired :show-message="false">
                    <CheckboxGroup v-model="form.data.card_available_notification.select">
                      <Checkbox v-for="item in options.sites" :key="item.value" :label="item.value" :disabled="item.disabled">{{ item.label }}</Checkbox>
                    </CheckboxGroup>
                  </FormItemBox>
                  <FormItemBox :label="$t('notificationSettings.warningAmount')" prop="data.card_available_notification.available" isRequired :show-message="false">
                    <FormNumber v-model="form.data.card_available_notification.available" :min="1" :precision="2" :placeholder="$t('notificationSettings.warningPlaceholder')" :formatter="value => `$ ${value}`" :parser="value => value.replace(/\$\s?|(,*)/g, '')"/>
                  </FormItemBox>
              </div>
          </section>

          <section class="message-set-item">
              <div class="message-set-header">
                <div class="message-set-heading">
                  <div class="message-set-title"><b>{{ $t('notificationSettings.consumptionFailed') }}</b></div>
                  <p>{{ $t('notificationSettings.consumptionFailedDesc') }}</p>
                </div>
                <div class="message-set-toggle">
                  <span>{{ form.data.consumption_fail_notification.status ? $t('notificationSettings.enabled') : $t('notificationSettings.disabled') }}</span>
                  <FormSwitch
                    v-model="form.data.consumption_fail_notification.status"
                    :trueValue="1"
                    :falseValue="0"
                    :aria-label="$t('notificationSettings.consumptionFailed')"
                  />
                </div>
              </div>

              <div v-if="form.data.consumption_fail_notification.status" class="message-set-fields">
                  <FormItemBox :label="$t('notificationSettings.method')" prop="data.consumption_fail_notification.select" isRequired :show-message="false">
                    <CheckboxGroup v-model="form.data.consumption_fail_notification.select">
                      <Checkbox v-for="item in options.sites" :key="item.value" :label="item.value" :disabled="item.disabled">{{ item.label }}</Checkbox>
                    </CheckboxGroup>
                  </FormItemBox>
              </div>
          </section>
        </div>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { message } from '@/utils/message.js'
import { postApi } from "@/utils/api.js";
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user.js'
const userStore = useUserStore()
const { user} = storeToRefs(userStore)
import { reactive } from 'vue';
import { t } from '@/utils'
  const options=reactive({
    sites:[
      {
        label: t('notificationSettings.onsite'),
        value:'notice',
        disabled:true
      },
      {
        label: t('notificationSettings.email'),
        value:'email'
      }
    ]
  })
  const pup = reactive({
    status:false,
    title: t('notificationSettings.title'),
    width:'600',
    labelPosition:'top',
    form:{
      type: "notification",
      data: {
          //卡片余额不足通知
          card_available_notification: {
              available:null,
              status: 0,
              select: ['notice']
          },
          //消费失败通知
          consumption_fail_notification: {
              status: 0,
              select: ['notice']
          }
      },
      card_ids:[],
    },
    actions:[
      {
        label: t('notificationSettings.confirm'),
        click: (pup) => {
          confirm()
        }
      }
    ]
  })
  const emit=defineEmits(['confirm'])
  //确认
  const confirm=()=>{
    postApi('/user/setExtraConfig',pup.form)
      .then((res) => {
        message(t('notificationSettings.success'))
        pup.status=false
        if(pup.form.card_ids.length>0){
          emit('confirm')
        }else{
          userStore?.getUserInfo?.()
        }
      }).catch((err) => {
        message(err?.msg || err || t('notificationSettings.failed'), 'error')
      }).finally(()=>{
        pup.buttonLoading=false
      })
  }
  const open=(rows)=>{
    pup.status=true
    const default_data={
       //卡片余额不足通知
        card_available_notification: {
            available:null,
            status: 0,
            select: ['notice']
        },
        //消费失败通知
        consumption_fail_notification: {
            status: 0,
            select: ['notice']
        }
    }
    if(rows?.length>0){
      pup.form.card_ids=rows.map(item=>item.id)
      pup.form.data=rows[0]?.extra_config?.notification || default_data
    }else{
      pup.form.card_ids=[]
      pup.form.data=user.value?.extra_config?.notification || default_data
    }
    for(let key in pup.form.data){
      pup.form.data[key].select=pup.form.data[key].select.map(item=>{
        switch (item) {
          case 0:
            return 'notice'
          case 1:
            return 'email'
          case 2:
            return 'telegram'
          default:
            return item
        }
      }).filter(item=>item!=='telegram')
    }
  }
  defineExpose({
    open,
  })
</script>
<style scoped lang="less">
.message-set-box{
  color: var(--ui-color-text);

  .message-set-description{
    margin: 0 0 12px;
    color: var(--ui-color-neutral-600);
    font-size: 12px;
    line-height: 20px;
  }

  .message-set-list{
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message-set-item{
    padding: var(--ui-padding-16);
    border-radius: var(--ui-radius-6);
    background: linear-gradient(180deg, #f7f9fd 0%, #f3f6fb 100%);
    box-shadow: inset 0 1px 0 #fff;
  }

  .message-set-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .message-set-heading{
    min-width: 0;

    p{
      margin: var(--ui-margin-3-0-0);
      color: var(--ui-color-neutral-600);
      font-size: 12px;
      line-height: 18px;
    }
  }

  .message-set-title{
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 22px;
    color: var(--ui-color-text);
    font-size: 14px;
    line-height: 22px;

    b{ font-weight: 600; }
  }

  .message-set-help{
    display: inline-flex;
    color: var(--ui-color-text-muted);
    font-size: 14px;
    cursor: help;
  }

  .message-set-toggle{
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    color: var(--ui-color-neutral-600);
    font-size: 12px;
    white-space: nowrap;
  }

  .message-set-fields{
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    margin-top: 16px;

    &--balance{
      grid-template-columns: minmax(0, 1.35fr) minmax(160px, .8fr);
    }

    :deep(.ivu-form-item){
      margin-bottom: 0;
    }

    :deep(.ivu-form-item-label){
      padding-bottom: 6px;
      color: var(--ui-color-neutral-800);
      font-size: 12px;
      line-height: 18px;
    }

    :deep(.ivu-checkbox-group){
      display: flex;
      min-height: 34px;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    :deep(.ivu-checkbox-wrapper){
      margin-right: 0;
      color: var(--ui-color-text);
    }

    :deep(.ivu-checkbox-disabled + span){
      color: var(--ui-color-text-muted);
    }

    :deep(.ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner){
      border-color: #c5cedc;
      background: #e7ecf5;
    }

    :deep(.ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner::after){
      border-color: #6f7d92;
    }
  }
}

@media (max-width: 768px){
  .message-set-box{
    .message-set-item{ padding: var(--ui-padding-14); }

    .message-set-header{
      align-items: flex-start;
      gap: 12px;
    }

    .message-set-toggle{
      min-height: 44px;
      margin-top: -8px;
    }

    .message-set-fields,
    .message-set-fields--balance{
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
      margin-top: 14px;
    }

    .message-set-fields :deep(.ivu-checkbox-group){
      gap: 10px 16px;
    }
  }
}

</style>
