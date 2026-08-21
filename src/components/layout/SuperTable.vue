<template>
    <div class="super-table">
        <template v-if="$slots.headerSearch">
            <slot name="headerSearch" :tbody="dataList"></slot>
        </template>
        <div class="super-table-header" v-else>
            <div class="super-table-header-left">
                <slot name="header-left"></slot>
            </div>
            <div class="super-table-header-right">
                <slot name="header-right" :tbody="dataList"></slot>
                <Button v-if="refresh" @click="init">
                    <Icon type="md-refresh" :size="16" :class="{'spin-anim': isRefreshing }" />
                    <span class="ml-5">刷新</span>
                </Button>
            </div>
        </div>
        <Table
            ref="table"
            :columns="columns"
            :data="dataList"
            :height="height"
            :max-height="maxHeight"
            :loading="cloneLoading"
            :border="border"
            :size="size"
            :stripe="stripe"
            :draggable="draggable"
            :span-method="spanMethod"
            :show-summary="showSummary"
            :sum-text="sumText"
            :summary-method="summaryMethod"
            @on-expand="handleExpand"
            @on-selection-change="handleSelectionChange"
            @on-drag-drop="handleDragDrop"
        >
            <template v-if="$slots['header']" #header><slot name="header"></slot></template>
            <template v-for="item in slots" #[item.slot]="param">
                <slot :name="item.slot" v-bind="param"></slot>
            </template>
        </Table>
        <div class="super-table-page">
            <div class="super-table-page-left">
                <slot name="page-left"></slot>
            </div>
            <Page
                :model-value="page.current"
                :page-size-opts="[10, 20, 30, 40, 100]"
                :page-size="page.size"
                :total="page.total"
                show-total
                show-elevator
                show-sizer
                @on-change="handleChangePage"
                @on-page-size-change="handleChangePageSize"
            />
        </div>
    </div>
</template>

<script>
import request from '@/api/request.js';
export default {
    name: 'SuperTable',
    props: {
        // 接口路径地址
        path: {
            type: String,
            default: ''
        },
        method: {
            type: String,
            default: 'post'
        },
        // 请求参数
        params: {
            type: Object,
            default: function() {
                return {};
            }
        },
        columns: {
            type: Array,
            default: function() {
                return [];
            }
        },
        stripe: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: true
        },
        height: Number | String,
        maxHeight: Number | String,
        loading: {
            type: Boolean,
            default: true
        },
        size: {
            type: String,
            default: 'default'
        },
        draggable: {
            type: Boolean,
            default: false
        },
        spanMethod: Function,
        showSummary: {
            type: Boolean,
            default: false
        },
        sumText: {
            type: String,
            default: ''
        },
        summaryMethod: Function,
        pagination: {
            type: Boolean,
            default: true
        },
        defaultData: {
            type: Array,
            default: function() {
                return [];
            }
        },
        // 是否自动加载
        auto: {
            type: Boolean,
            default: true
        },
        refresh: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            dataList: [],
            // columns插槽
            slots: [],
            // 分页
            page: {
                current: 1,
                size: this.params.pageSize || this.params.limit || 10,
                total: 0
            },
            cloneLoading: true,
            isRefreshing: false
        }
    },
    mounted() {
        // 获取columns里的slot
        this.slots = this.columns.filter(item => {
            return item.slot;
        })
        // 数据处理
        if(this.defaultData.length > 0) {
            this.dataList = this.defaultData;
            this.cloneLoading = false;
        }else{
            // 初始化
            if(this.auto) {
                this.init();
            }
        }
    },
    watch: {
        /* params: {
            handler(cur, old) {
                this.init();
            },
            deep: true
        }, */
        defaultData: {
            handler(cur, old) {
                this.dataList = cur;
            },
            deep: true
        }
    },
    methods: {
        init() {
            if (this.isRefreshing) return
            this.isRefreshing = true
            setTimeout(() => {
                this.params.page = 1;
                this.handleLoadData();
                this.isRefreshing = false;
            }, 300);
        },
        reload() {
            this.handleLoadData();
        },
        render(data) {
            this.dataList = data;
            this.$forceUpdate();
        },
        handleLoadData() {
            if(!this.path) return false;
            let params = this.params;
            if(this.method === 'get') params = {params: params};
            this.cloneLoading = this.loading;
            request[this.method](this.path, params).then((res) => {
                // 返回的数据为空，且非第一页时，需重新加载前一页的数据
                if(res.data.length === 0 && res.current_page !== 1) {
                    this.params.page = this.params.page - 1;
                    this.handleLoadData();
                    return false;
                }
                // 数据设置
                   if (this.pagination === true) {
                    this.dataList = res.data;
                    this.page.total = res.total;
                    this.page.current = res.current_page;
                } else {
                    this.dataList = res;
                }
                this.cloneLoading = false;
                this.$emit('on-loaded', true);
                this.$emit('on-selection-change', []);
            }).catch((err) => {
                this.cloneLoading = false;
                this.$emit('on-loaded', false);
            });
        },
        // 切换页码
        handleChangePage(page) {
            if (this.pagination === true) {
                this.params.page = page;
                this.handleLoadData();
            }
        },
        // 切换每页条数
        handleChangePageSize(size) {
            if (this.pagination === true) {
                this.params.page = 1;
                this.params.limit = size;
                this.handleLoadData();
            }
        },
        // 展开或收起某一行
        handleExpand(row, status,) {
            this.$emit('on-expand', row, status);
        },
        // 多选，选项发生变化
        handleSelectionChange(selection) {
            this.$emit('on-selection-change', selection);
        },
        // 拖拽排序松开触发
        handleDragDrop(index1, index2) {
            this.$emit('on-drag-drop', index1, index2);
        }
    }
}
</script>

<style lang="less">
.super-table {
    &-header {
        display: flex;
        justify-content: space-between;
        &-left {
            margin-right: 20px;
            white-space: nowrap;
        }
        &-right {
            display: flex;
            flex-wrap: wrap;
            & > div + div {
                margin-left: 10px;
            }
        }
    }
    &-page {
        display: flex;
        margin-top: 20px;
        justify-content: space-between;
        &-left {
            line-height: 32px;
        }
    }
}
</style>
