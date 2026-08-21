<template>
    <div class="message-layout">
        <div class="ui-breadcrumb breadcrumb-bar">
            <div class="back" @click="handleBack">
                <Icon type="ios-arrow-back" :size="16" />
                <span>{{ $t('messageCenter.back') }}</span>
            </div>
            <div class="spacer"></div>
            <span>{{ $t('messageCenter.detail') }}</span>
        </div>
        <div v-if="loading" class="loading-box">
            <UiLoading></UiLoading>
        </div>
        <div class="message-wrap">
            <h3>{{ detail.title }}</h3>
            <p class="time">{{ detail.create_time }}</p>
            <div class="content" v-html="detail.content"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user.js'
import { userApi } from '@/api'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import UiLoading from '@/components/layout/UiLoading.vue'
import { t } from '@/utils'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore();

const loading = ref(false)
const detail = ref({})

const init = function() {
    const id = route.query.id;
    if(!id) {
        message(t('messageCenter.missingId'), 'error');
        return false;
    }
    loading.value = true;
    userApi.msgDetail({id: route.query.id}).then((res) => {
        loading.value = false;
        detail.value = res.msgInfo || {};
        userStore.getMessageNum();
    }).catch(err => {
        loading.value = false;
        message(err.msg || t('messageCenter.loadFailed'), 'error');
    })
}

const handleBack = function() {
    router.back();
}

onMounted(() => {
    init();
})
</script>

<style scoped>
.message-layout {
    background-color: #fff;
}
.message-wrap {
    padding: var(--ui-padding-30);
}
.message-wrap h3 {
    text-align: center;
}
.message-wrap .time {
    margin: var(--ui-margin-5-0-20);
    color: var(--ui-color-neutral-550);
    text-align: center;
}
.breadcrumb-bar {
    padding: var(--ui-padding-15-20);
    border-bottom: 1px solid #fcfcfc;
}
.loading-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
}
</style>
