<template>
    <div class="security-wrapper">
        <div class="security-block">
            <div class="block-title">
                <Icon type="ios-phone-portrait" /> {{ $t('security.loginRecords.title') }}
            </div>
            
            <div class="section-desc">{{ $t('security.loginRecords.description') }}</div>
            
            <div class="device-cards" v-if="deviceList && deviceList.length > 0">
                <div v-for="(item, index) in deviceList" :key="index" class="device-card">
                    <div class="device-icon">
                        <Icon :type="getDeviceIcon(item.login_os)" size="28" />
                    </div>
                    <div class="device-info">
                        <div class="device-title">
                            {{ item.login_os || $t('security.loginRecords.unknownDevice') }}
                            <Tag v-if="item.is_current === 1" color="success" class="current-tag">{{ $t('security.loginRecords.currentDevice') }}</Tag>
                        </div>
                        <div class="device-meta">{{ item.login_browser || $t('security.loginRecords.unknownBrowser') }}</div>
                        <div class="device-meta">
                            <span>IP: {{ item.login_ip || '--' }}</span>
                            <span class="dot-divider">•</span>
                            <span>{{ $t('security.loginRecords.loginTime') }}: {{ item.created_at || '--' }}</span>
                        </div>
                    </div>
                    <div class="device-action">
                        <Button v-if="item.is_current !== 1" type="error" @click="kickDevice(item)">
                            <Icon type="md-power" /> {{ $t('security.loginRecords.offline') }}
                        </Button>
                    </div>
                </div>
            </div>
            
            <div v-else-if="tableLoading" class="device-empty">
                <Spin size="large" fix />
            </div>
            
            <div v-else class="device-empty">
                <Icon type="ios-phone-portrait" size="48" />
                <p>{{ $t('security.loginRecords.empty') }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue'
import { Message, Modal } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { userApi } from '@/api'
import { t } from '@/utils'

// 设备列表
const deviceList = ref([])
const tableLoading = ref(false)

// 根据操作系统获取设备图标
const getDeviceIcon = (os) => {
    if (!os) return 'ios-phone-portrait';
    os = os.toLowerCase();
    
    if (os.includes('windows')) return 'logo-windows';
    if (os.includes('mac') || os.includes('apple')) return 'logo-apple';
    if (os.includes('android')) return 'logo-android';
    if (os.includes('linux')) return 'logo-tux';
    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) return 'logo-apple';
    
    return 'ios-phone-portrait';
}

// 初始化函数
const init = async () => {
    tableLoading.value = true;
    await getLoginTokens();
    tableLoading.value = false;
}

// 获取登录设备
const getLoginTokens = async () => {
    try {
        const res = await userApi.getLoginTokens();
        if (res) {
            deviceList.value = res;
        }
    }
    catch (e) {
        message(t('security.loginRecords.loadFailed'), 'error');
    }
};

// 踢出设备
const kickDevice = function(device) {
    Modal.confirm({
        title: t('security.loginRecords.confirmTitle'),
        width: 340,
        content: `<p>${t('security.loginRecords.confirmContent')}</p>`,
        okText: t('security.loginRecords.confirm'),
        cancelText: t('security.loginRecords.cancel'),
        onOk: () => {
            const msg = Message.loading({
                content: t('security.loginRecords.submitting'),
                duration: 0
            });
            userApi.clearToken({token: device.token}).then(() => {
                msg();
                message(t('security.loginRecords.success'));
                getLoginTokens()
            }).catch(err => {
                msg();
                message(err.msg || t('security.loginRecords.failed'), 'error');
            })
        }
    })
}

// 在组件挂载时初始化
onMounted(() => {
    init();
})

// 将方法暴露给父组件
defineExpose({
    init
})
</script>

<style scoped>
.security-wrapper {
    padding: var(--ui-padding-10-0);
}

.security-block {
    margin-bottom: 30px;
}

.block-title {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
}

.block-title .ivu-icon {
    margin-right: 6px;
}

.section-desc {
    color: var(--ui-color-neutral-550);
    font-size: 12px;
    margin-bottom: 20px;
}

.device-cards {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.device-card {
    display: flex;
    padding: var(--ui-padding-16);
    background-color: #f8f8f9;
    border-radius: var(--ui-radius-sm);
    transition: all 0.3s;
}

.device-card:hover {
    background-color: #f0f0f0;
}

.device-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-size-60);
    color: var(--ui-color-control-text);
}

.device-info {
    flex: 1;
    padding-right: 15px;
}

.device-title {
    font-weight: 500;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
}

.current-tag {
    margin-left: 8px;
    font-size: 12px;
    padding: var(--ui-padding-0-5);
    height: var(--ui-size-20);
    line-height: 20px;
}

.device-meta {
    color: var(--ui-color-control-text-muted);
    font-size: 12px;
    margin-top: 5px;
}

.dot-divider {
    margin: var(--ui-margin-0-8);
}

.device-action {
    display: flex;
    align-items: center;
}

.device-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: var(--ui-size-150);
    color: var(--ui-color-control-text-disabled);
}

.device-empty p {
    margin-top: 15px;
}
</style>
