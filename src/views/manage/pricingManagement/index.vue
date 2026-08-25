<template>
  <UiPage isNotTitle>
    <div class="pricing-management-page">
    <Alert>
        <div class="tips list-r-8">
            <span>{{ $t('groupManagement.drag_tip1') }}</span><Icon type="md-keypad" class="drag-handle" :title="$t('groupManagement.dragSort')"/><span>{{ $t('groupManagement.drag_tip2') }}</span>
        </div>
    </Alert>
    <VueDraggable class="group-box" :style="{
      gridTemplateColumns: isPhone ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))'
    }" v-model="data.list" handle=".drag-handle" :animation="150" @end="onDragEnd">
        <div class="group-item" v-for="element in data.list" :key="element.id">
            <div class="group-item-header-top">
                <div class="group-item-header-left">
                    <Icon type="md-keypad" class="drag-handle" :title="$t('groupManagement.dragSort')"/>
                    <Tag color="default" v-if="!element.agent_site_id">{{$t('groupManagement.builtIn')}}</Tag>
                </div>
                <div class="group-item-header-right list-r-8">
                    <Button type="text" @click="copyInviteCode(element)">{{ $t('groupManagement.inviteCode') }}</Button>
                    <Tooltip placement="top" :content="element.is_visible?$t('groupManagement.stop'):$t('groupManagement.enable')">
                        <FormSwitch v-model="element.is_visible" size="small" :options="options.switch" trueText=" " falseText=" " :true-value="true" :false-value="false"  @on-change="groupVisible(element)"/>
                    </Tooltip>
                </div>
            </div>
            <div class="group-item-center list-b-16">
                <div class="group-item-header list-r-12">
                    <div class="group-item-header-title">
                        <template v-if="element.isEdit">
                            <FormInput v-model="element.form.title" :placeholder="$t('groupManagement.title')" :maxlength="20"/>
                        </template>
                        <template v-else>
                            <h3 :title="element.title_alias || element.title">{{ element.title_alias || element.title }}</h3>
                            <Tooltip placement="top" :content="`${$t('groupManagement.edit')}${$t('groupManagement.title_alias')}`">
                                <Icon type="md-create" size="16" @click="eidtName(element)"/>
                            </Tooltip>
                        </template>
                    </div>
                    <div class="group-item-price">
                         <template v-if="element.isEdit">
                            <FormNumber  :min="0" :precision="3" v-model="element.form.price"  :placeholder="$t('groupManagement.price')" :formatter="value => `$ ${value}`" :parser="value => value.replace(/\$\s?|(,*)/g, '')"/>
                        </template>
                        <template v-else>
                            <span class="sub">$</span>
                            <span class="price">{{ element.price }}</span>
                        </template>
                    </div>
                </div>
                <div class="group-item-main">
                    <table class="group-item-table">
                        <colgroup>
                            <col style="min-width:100px;"/>
                            <col :width="80"/>
                            <col :width="12"/>
                            <col :width="80"/>
                            <col :width="12"/>
                            <col :width="80"/>
                        </colgroup>
                        <thead>
                            <tr>
                                <th class="text-left">{{$t('groupManagement.category')}}</th>
                                <th>{{$t('groupManagement.cost')}}</th>
                                <th></th>
                                <th>{{$t('groupManagement.markup')}}</th>
                                <th></th>
                                <th>{{$t('groupManagement.total')}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in priceList" :key="item.key">
                                <tr class="title">
                                    <td :colspan="6">
                                        <div  class="text">
                                            <b>{{$t(`groupManagement.${item.key}`)}}</b>
                                            <i>{{$t(`groupManagement.${item.destKey}`)}}</i>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="item.feeType=='fee' || !item.feeType">
                                    <td class="text-left">{{ $t('groupManagement.fee') }} <span class="unit">($/{{item.key==='create_amount'?$t('groupManagement.ordersUnit'):$t('groupManagement.transactionUnit')}})</span></td>
                                    <td>
                                        <div class="price-item isEdit disabled">
                                            <p>{{ element?.form?.[item.key]?.system?.fee || 0 }}</p>
                                        </div>
                                    </td>
                                     <td class="text-center">+</td>
                                    <td>
                                        <template v-if="element.isEdit">
                                            <FormNumber  size="small" :min="0" :precision="1" v-model="element.form[item.key].markup.fee" :placeholder="$t('groupManagement.fee')"/>
                                        </template>
                                        <template v-else>
                                            <div class="price-item isEdit" :class="{disabled:!element.agent_site_id}">
                                                <p>{{ element?.form?.[item.key]?.markup?.fee || 0 }}</p>
                                            </div>
                                        </template>
                                    </td>
                                    <td  class="text-center">=</td>
                                    <td>
                                        <div class="price-item isEdit disabled">
                                            <p>{{ sumCount(element?.form?.[item.key])?.fee || 0 }}</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr  v-if="item.feeType=='fee_rate' || !item.feeType">
                                    <td class="text-left">{{ $t('groupManagement.fee_rate') }} <span class="unit">(%)</span></td>
                                    <td>
                                        <div class="price-item isEdit disabled">
                                            <p>{{ element?.form?.[item.key]?.system?.fee_rate || 0 }}</p>
                                        </div>
                                    </td>
                                    <td  class="text-center">+</td>
                                    <td>
                                        <template v-if="element.isEdit">
                                            <FormNumber  size="small" :min="0" :max="100" :precision="1"  v-model="element.form[item.key].markup.fee_rate" @on-change="fee_rate_change(element.form[item.key].markup)" :placeholder="$t('groupManagement.fee_rate')"/>
                                        </template>
                                        <template v-else>
                                            <div class="price-item isEdit" :class="{disabled:!element.agent_site_id}">
                                                <p>{{ element?.form?.[item.key]?.markup?.fee_rate || 0 }}</p>
                                            </div>
                                        </template>
                                    </td>
                                    <td class="text-center">=</td>
                                    <td>
                                        <div class="price-item isEdit disabled">
                                            <p>{{ sumCount(element?.form?.[item.key])?.fee_rate || 0 }}</p>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="group-item-footer" :class="{isEdit:element.isEdit}">
                <template v-if="element.isEdit">
                    <div class="text-btn" @click="cancelBtn(element)">{{$t('groupManagement.cancel')}}</div>
                    <div class="ui-text-primary" :class="{loading: element.saving}" @click="!element.saving && saveBtn(element.form, element)">
                        <Icon v-if="element.saving" type="ios-loading" class="spin-icon"/>
                        <span>{{ $t('groupManagement.save') }}</span>
                    </div>
                </template>
                <template v-else>
                    <div class="" @click="copyBtn(element)" v-if="!element.agent_site_id">{{$t('groupManagement.clone')}}</div>
                    <div class="ui-text-primary"  @click="editBtn(element)" v-if="element.agent_site_id">{{$t('groupManagement.edit')}}</div>
                    <div class="ui-text-error" :class="{loading: element.deleting}" @click="!element.deleting && deleteBtn(element)" v-if="element.agent_site_id">
                        <Icon v-if="element.deleting" type="ios-loading" class="spin-icon"/>
                        <span>{{ $t('groupManagement.delete') }}</span>
                    </div>
                </template>
            </div>
        </div>
    </VueDraggable>
      <Spin fix v-if="data.loading" />
    </div>
  </UiPage>
</template>

<script setup>
import { isPhone } from '@/utils/device.js'
import { onMounted } from 'vue'
import { options,getData,data,groupVisible,eidtName,deleteBtn,copyBtn,priceList,onDragEnd,saveBtn,sumCount,editBtn,cancelBtn,fee_rate_change,copyInviteCode } from './data.js'
import { VueDraggable } from 'vue-draggable-plus'

onMounted(getData)
</script>
<style lang="less" scoped>
.pricing-management-page{
    position: relative;
    min-height: 320px;
}
.tips{
    color: var(--primary-color);
}
.group-box{
    display: grid;
    gap:16px;
    .group-item{
        border: 1px #eee solid;
        border-radius:8px;
        overflow: hidden;
        background: #fff;
        position: relative;
        display: flex;
        flex-direction: column;
        &:hover{
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        > *{
            &:not(:last-child){
                border-bottom: 1px #eee solid;
            }
        }
        .group-item-header-top{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background: linear-gradient(-0deg, #fafafa 0, #fff 100%);
            line-height:26px;
        }
        .group-item-center{
            padding:16px;
            flex: 1;
        }
        .group-item-header-left{
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .drag-handle{
            cursor: move;
        }
        .group-item-header-right{
            z-index: 1;
        }
        .group-item-header{
            display: flex;
            justify-content: space-between;
            box-sizing: border-box;
            gap:2px;
            align-items: center;
            >*{
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .group-item-header-title{
                flex: 1;
                height: 40px;
                display: flex;
                justify-content: flex-start;
                h3{
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    display: -webkit-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    word-break: break-all;
                }
                .ivu-icon{
                    cursor: pointer;
                }
                &:hover{
                    .ivu-icon{
                        color:var(--primary-color);
                    }
                }
            }
        }
        .group-item-price{
            display: flex;
            align-items: end;
            justify-content: center;
            gap:2px;
            line-height: 1;
            max-width: 120px;
            color: var(--primary-color);
            .sub{
                position: relative;
                top: -3px;
            }
            .price{
                font-size: 26px;
                font-weight: bold;
            }
        }
        .group-item-table{
            width: 100%;
            border-collapse: collapse;
            line-height:16px;
            text-align: center;
            .text-center{
                text-align: center;
            }
            .text-left{
                text-align: left;
            }
            th,
            td{
                padding:4px 8px;
            }
            .unit{
                color: #999aaa;
                font-size: 12px;
            }
            tr{
                &:not(:last-child){
                    border-bottom: 1px #eee solid;
                }
            }
            .price-item{
                display: flex;
                align-items: center;
                justify-content: center;
                gap:6px;
                line-height: 28px;
                &.disabled{
                    background: #fff;
                    border-color: #fff;
                }
                span{
                    color: #999aaa;
                }

            }
            thead{
                th{
                    color: #476cad;
                    line-height: 32px;
                }
            }
            .title{
                background: #e3e7f5;
                text-align: left;
                .text{
                    display: flex;
                    align-items: end;
                    gap: 8px;
                    line-height:16px;
                    padding: 4px 0;
                    i{
                        color: #999aaa;
                        font-size: 12px;
                        position: relative;
                        bottom: -2px;
                    }
                }
            }
        }
        .group-item-main{
            overflow: hidden;
            dl{
                display: flex;
                dt{
                    color: #999aaa;
                    width: 100px;
                    display: flex;
                    gap: 4px;
                }
                dd{
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    gap: 4px;
                }
            }
        }
        .group-item-footer{
            display: flex;
            background: #fafafa;
            >*{
                flex: 1;
                text-align: center;
                cursor: pointer;
                padding: 8px;
                line-height:26px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 5px;
                &:not(:last-child){
                    border-right: 1px #eee solid;
                }
                &:hover{
                    background-color: var(--primary-color);
                    color: #fff;
                    &.ui-text-error{
                        background-color: var(--error-color);
                    }
                }
            }
            &.isEdit{
                >*{
                    &:hover{
                        color:  var(--primary-color);
                        background:none;
                    }
                    &.ui-text-primary{
                        background-color: var(--primary-color);
                        color: #fff;
                    }
                }
            }
        }
    }
}
.spin-icon {
    animation: spin 1s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.loading {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
