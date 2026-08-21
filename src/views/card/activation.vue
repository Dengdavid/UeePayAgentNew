<template>
    <div class="activate-wrap">
        <div class="step-box">
            <div class="step-item" v-for="(item, index) in steps" :class="{active: index <= stepActive}">
                <div class="index">{{ index + 1 }}</div>
                <div class="text">{{ item }}</div>
            </div>
        </div>
        <Divider></Divider>
        <div v-if="stepActive === 0" class="content-box">
            <Form v-if="identifyStep === 0" label-position="left" :label-width="70">
                <div class="radio-cells">
                    <div class="radio" :class="{checked: form.type === 1}" @click="handleSwitchType(1)">
                        <div class="title">{{ $t('card.index.activation.mainlandChina') }}</div>
                        <div class="desc">{{ $t('card.index.activation.identityVerification') }}</div>
                    </div>
                    <div class="radio" :class="{checked: form.type === 2}" @click="handleSwitchType(2)">
                        <div class="title">{{ $t('card.index.activation.outsideMainlandChina') }}</div>
                        <div class="desc">{{ $t('card.index.activation.internationalVerification') }}</div>
                    </div>
                </div>
                <div v-if="form.type === 1">
                    <div class="form-cell">
                        <div class="title">{{ $t('card.index.activation.uploadIdCard') }}</div>
                        <div class="desc">{{ $t('card.index.activation.mainlandRequirement') }}</div>
                        <div class="upload-cells">
														<div class="upload-cell">
															<ImageUpload v-model:id="form.frontAttachmentId" v-model:url="form.frontUrl" :width="194" :height="140" :maxSize="5120">
																<img src="@/assets/images/icon_upload_1.png" />
															</ImageUpload>
													<div class="label">{{ $t('card.index.activation.uploadPortrait') }}<br/>({{ $t('card.index.activation.uploadRequirement') }})</div>
														</div>
                            <div class="upload-cell">
                                <ImageUpload v-model:id="form.backAttachmentId" v-model:url="form.backUrl" :width="194" :height="140" :maxSize="5120">
                                    <img src="@/assets/images/icon_upload_2.png" />
                                </ImageUpload>
                                <div class="label">{{ $t('card.index.activation.uploadEmblem') }}<br/>({{ $t('card.index.activation.uploadRequirement') }})</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-20 pt-20">
                        <Button type="primary" style="width: 130px;" :loading="submiting" :disabled="!canSubmit" @click="handleIdentify">{{ $t('card.index.activation.submit') }}</Button>
                    </div>
                </div>
                <div v-if="form.type === 2">
                    <div class="form-cell">
                        <div class="title">{{ $t('card.index.activation.internationalVerification') }}</div>
                        <div class="desc">{{ $t('card.index.activation.internationalRequirement') }}</div>
                    </div>
                    <div class="form-cell">
                        <div class="title">{{ $t('card.index.activation.stepOne') }}</div>
                        <div class="desc">{{ $t('card.index.activation.scanQrCode') }}</div>
                        <div class="qrcode-box mt-10">
                            <p v-if="isGetQrcodeErr">{{ $t('card.index.activation.loadFailed') }}<a @click="getQrcode">{{ $t('card.index.activation.retry') }}</a></p>
														<img v-if="isGetQrcodeing" src="@/assets/images/loading.gif" alt="Loading" />
                            <img v-if="!isGetQrcodeErr && form.qrcodeUrl" :src="form.qrcodeUrl" />
                        </div>
                    </div>
                    <div class="form-cell">
                        <div class="title">{{ $t('card.index.activation.stepTwo') }}</div>
                        <div class="desc">{{ $t('card.index.activation.submitVerificationInstruction') }}</div>
                    </div>
                    <div class="mt-20 pt-20">
                        <Button type="primary" style="width: 184px;" :loading="submiting" :disabled="!canSubmitOther" @click="handleOtherIdentity">{{ $t('card.index.activation.verificationSubmitted') }}</Button>
                    </div>
                </div>
            </Form>
            <div v-if="identifyStep === 1" class="content-box">
                <div class="center-box">
                    <div class="icon">
                        <img src="@/assets/images/icon_activation_4.png" />
                    </div>
                    <div class="title">
                        <p>{{ $t('card.index.activation.verificationApproved') }}</p>
                    </div>
                    <p class="desc">{{ $t('card.index.activation.approvedDescription') }}</p>
                    <div class="form">
                        <Button type="primary" long @click="stepActive = 1">{{ $t('card.index.activation.startActivation') }}</Button>
                    </div>
                </div>
            </div>
            <div v-if="identifyStep === 2" class="content-box">
                <div class="center-box">
                    <div class="icon">
                        <img src="@/assets/images/icon_activation_2.png" />
                    </div>
                    <div class="title">{{ $t('card.index.activation.verificationRejected') }}</div>
                    <p class="desc" style="color: #FF4E4E">{{ errorMessage }}</p>
                    <div class="form">
                        <Button type="primary" long @click="identifyStep = 0">{{ $t('card.index.activation.resubmit') }}</Button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="stepActive === 1" class="content-box">
            <div class="center-box">
                <div class="icon">
                    <img src="@/assets/images/icon_activation_3.png" />
                </div>
                <div class="title">
                    <p>{{ cardNo }}</p>
                    <p>{{ $t('card.index.activation.verified') }}</p>
                </div>
                <p class="desc">{{ $t('card.index.activation.activationInstructionBefore') }}<span class="ui-text-red">{{ $t('card.index.activation.activationCodeQuoted') }}</span>{{ $t('card.index.activation.activationInstructionAfter') }}</p>
                <div class="form">
                    <Input v-model="form.code" :placeholder="$t('card.index.activation.enterPlaceholder')" maxlength="6">
                        <template #prepend>
                          <span class="pl-10 pr-10">{{ $t('card.index.activation.activationCode') }}</span>
                        </template>
                    </Input>
                    <p v-if="errTips" class="mt-5 ui-text-error">{{ errTips }}</p>
                    <div class="mt-20 pt-20">
                        <Button type="primary" long :loading="submiting" :disabled="!form.code" @click="handleActivate">{{ $t('card.index.activation.confirm') }}</Button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="stepActive === 2" class="content-box">
            <div class="center-box">
                <div class="icon">
                    <img src="@/assets/images/icon_activation_4.png" />
                </div>
                <div class="title">{{ $t('card.index.activation.activationSuccess') }}</div>
                <p class="desc">{{ $t('card.index.activation.successDescription') }}</p>
                <div class="form">
                    <Button type="primary" long replace :to="{name: 'cardPhysical'}">{{ $t('card.index.activation.applyAgain') }}</Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardApi } from '@/api'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import ImageUpload from '@/components/utils/image-upload.vue'
import QRCode from "qrcode";
import { t } from '@/utils'

const route = useRoute()
const router = useRouter()

const steps = [t('card.index.activation.steps.verification'), t('card.index.activation.steps.activation'), t('card.index.activation.steps.complete')]
const stepActive = ref(0)
const errorMessage = ref(t('card.index.activation.rejectionDefault'))

const loading = ref(false)
const submiting = ref(false)
const isGetQrcodeErr = ref(false)
const isGetQrcodeing = ref(false)
const identifyStep = ref(0)

const card = ref({})
const form = ref({
    type: 1,
    cardId: route.query.id,
    qrcodeUrl: '',
    frontAttachmentId: '',
    frontUrl: '',
    backAttachmentId: '',
    backUrl: '',
    code: ''
})
const errTips = ref('')

const cardNo = computed(() => {
    const no = card.value.card_no;
    if(!no) return '--';
    return no.replace(/(\d{4})(?=\d)/g, '$1 ');
})

const init = function() {
    const id = route.query.id;
    if(!id) {
        router.push({name: 'error_404'});
        return false;
    }
    // 获取卡片详情
    loading.value = true;
    cardApi.vccInfo({cardId: id}).then(res => {
        card.value = res;
        if(res.physical !== 1) {
            errMsg(t('card.index.activation.notPhysicalCard'));
            return false;
        }
        if(res.deliver_status === 0) {
            errMsg(t('card.index.activation.physicalCardNotApplied'));
            return false;
        }
        if(res.deliver_status <= 1) {
            errMsg(t('card.index.activation.waitForDelivery'));
            return false;
        }
        // 认证
        if(res.physical_status === 0) {
            stepActive.value = 0;
            return false;
        }
        // 卡片待激活
        if(res.physical_status === 1) {
            stepActive.value = 1;
            return false;
        }
        // 卡片已激活
        if(res.physical_status === 2) {
            stepActive.value = 2;
            return false;
        }
        loading.value = false;
    }).catch(err => {
        errMsg(err.msg || t('card.index.activation.pageLoadFailed'));
    })
}

const errMsg = function(msg) {
    message(msg, 'error', {
        onClose: function() {
            router.back();
        }
    })
}

// 切换认证类型
const handleSwitchType = function(type) {
    if(form.value.type === type) return false;
    form.value.type = type;
    // 非中国大陆地区且未获取二维码的需要获取二维码
    if(type === 2 && !form.value.qrcodeUrl) {
        getQrcode()
    }
}
// 获取二维码
const getQrcode = function() {
		if(isGetQrcodeing.value) return false;
		isGetQrcodeing.value = true;
		cardApi.vccHolderIdentityUrl({cardId: form.value.cardId}).then(async res => {
			try {
				form.value.qrcodeUrl = await QRCode.toDataURL(res, {
					errorCorrectionLevel: 'H',
					type: 'image/jpeg',
					quality: 0.8,
					margin: 2
				});
				isGetQrcodeErr.value = false;
			} catch (error) {
				isGetQrcodeErr.value = true;
			}
		}).catch(() => {
			isGetQrcodeErr.value = true;
		}).finally(() => {
			isGetQrcodeing.value = false;
		});
}

//我已提交认证
const canSubmitOther = computed(() => {
	return form.value.cardId && form.value.qrcodeUrl;
})

//提交认证
const canSubmit = computed(() => {
	return form.value.cardId &&
			form.value.frontAttachmentId &&
			form.value.backAttachmentId
})

// 提交认证
const handleIdentify = function() {
	if(submiting.value || !canSubmit.value) return false;
	if(!form.value.frontAttachmentId) {
        message(t('card.index.activation.uploadPortraitRequired'), 'error');
        return false;
    }
    if(!form.value.backAttachmentId) {
        message(t('card.index.activation.uploadEmblemRequired'), 'error');
        return false;
    }
    const params = {
        cardId: form.value.cardId,
        frontAttachmentId: form.value.frontAttachmentId,
        backAttachmentId: form.value.backAttachmentId
    }
    submiting.value = true;
    cardApi.vccHolderIdentity(params).then(res => {
        identifyStep.value = 1;
        submiting.value = false;
    }).catch(err => {
        identifyStep.value = 2;
        submiting.value = false;
        let content = err.msg || t('card.index.activation.submitFailed')
        message(content, 'error',{
            duration: 5
        });
        errorMessage.value = content;
    })
}

// 其他认证
const handleOtherIdentity = function() {
    if(submiting.value) return false;
    submiting.value = true;
    cardApi.vccHolderIdentityOther({cardId: form.value.cardId}).then(res => {
        identifyStep.value = 1;
        submiting.value = false;
    }).catch(err => {
        identifyStep.value = 2;
        submiting.value = false;
        message(err.msg || t('card.index.activation.submitFailed'), 'error');
    })
}

// 激活
const handleActivate = function() {
    if(submiting.value) return false;
    if(!form.value.code) {
        errTips.value = t('card.index.activation.activationCodeRequired');
        return false;
    }
    submiting.value = true;
    cardApi.vccActivate({cardId: form.value.cardId, code: form.value.code}).then(res => {
        stepActive.value = 2;
    }).catch(err => {
        errTips.value = err.msg || t('card.index.activation.submitFailed');
        submiting.value = false;
    })
}

onMounted(() => {
    init()
})
</script>

<style lang="less" scoped>
.activate-wrap {
    margin-top: 20px;
    padding: 50px 20px 30px 20px;
    border-radius: var(--ui-radius-3xl);
    background: #FFFFFF;
}
.step-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 230px 30px;
}
.step-item {
    display: flex;
    align-items: center;
    flex: 1;
    .index {
        flex-shrink: 0;
        margin-right: 10px;
        width: var(--ui-size-28);
        height: var(--ui-size-28);
        font-size: 18px;
        color: var(--ui-color-text-inverse);
        text-align: center;
        line-height: 28px;
        border-radius: 27px;
        box-shadow: 0 0 0 3px rgba(132, 145, 165, 0.2);
        background: var(--ui-color-text-muted);
    }
    .text {
        flex-shrink: 0;
        font-size: 16px;
        color: var(--ui-color-text);
        font-weight: 500;
    }
    &:after {
        flex: 1;
        content: ' ';
        display: block;
        margin: 0 20px;
        height: var(--ui-size-1);
        background-color: #d8d8d8;
    }
}
.step-item:last-child {
    flex: none;
}
.step-item:last-child::after {
    display: none;
}
.step-item.active .index {
    box-shadow: 0 0 0 3px rgba(43, 92, 217, 0.2);
    background: var(--ui-color-primary);
}
.content-box {
    padding-top: 30px;
}
.form-cell {
    margin-top: 40px;
    .title {
        font-size: 18px;
        font-weight: 500;
        color: var(--ui-color-text);
    }
    .desc {
        font-size: 14px;
        color: var(--ui-color-neutral-550);
    }
}
.radio-cells {
    display: flex;
    flex-wrap: wrap;
    .radio {
        padding: 12px 40px;
        text-align: center;
        border-radius: var(--ui-radius-xl);
        border: var(--ui-border-muted);
        cursor: pointer;
        .title {
            font-size: 16px;
            font-weight: 600;
        }
    }
    .radio + .radio {
        margin-left: 20px;
    }
    .radio.checked {
        color: var(--ui-color-primary);
        border-color: var(--ui-color-primary);
    }
}
.upload-cells {
    display: flex;
    margin-top: 30px;
    .upload-cell {
        text-align: center;
        .label {
            margin-top: 10px;
            color: var(--ui-color-neutral-550);
        }
    }
    .upload-cell + .upload-cell {
        margin-left: 20px;
    }
}
.qrcode-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 246px;
    height: 246px;
    color: var(--ui-color-neutral-550);
    background-color: #fafafa;
    img {
        max-width: 100%;
        max-height: 100%;
    }
}
.center-box {
    text-align: center;
    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        width: 90px;
        height: 90px;
        img {
            max-width: 100%;
            max-height: 100%;
        }
    }
    .title {
        margin-top: 30px;
        font-size: 24px;
        font-weight: 600;
        line-height: 36px;
    }
    .desc {
        margin-top: 10px;
        font-size: 14px;
        color: var(--ui-color-neutral-550)}
    .form {
        margin: 50px auto;
        width: 400px;
        text-align: left;
    }
}
</style>
