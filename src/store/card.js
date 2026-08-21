import { defineStore } from 'pinia'
import { cardApi } from '@/api/index.js'

export const useCardStore = defineStore("cardStore", {
    persist: {
        enabled: true,
        strategies: [
            {
                paths: []
            }
        ]
    },
    state:() => ({
        bins: []
    }),
    getters: {
        binMaps(state) {
            let obj = {};
            state.bins.forEach(item => {
                obj[item.bin] = item;
            })
            return obj;
        }
    },
    actions: {
        async init() {
            // 获取卡段列表
            await this.getBinList();
        },
        async getBinList() {
            await cardApi.getBinList().then(res => {
                this.bins = res || [];
            }).catch(() => {
                // err
            })
        }
    }
})