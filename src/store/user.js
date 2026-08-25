import { defineStore } from 'pinia'
import { userApi } from '@/api/index.js'
import { useCardStore } from '@/store/card.js'
import { tokenName } from "@systemConfig";
import {
    DEFAULT_COUNTRY,
    DEFAULT_TIMEZONE,
    applyPreferences,
    getCachedCountry,
    getCachedLocale,
    getCachedTimezone,
    normalizeCountry,
    normalizeTimezone,
} from '@/utils/preferences.js'
import {
    clearPreferencesPendingSync,
    hasPendingPreferencesSync,
} from '@/utils/preferences-storage.js'
import { DEFAULT_LOCALE, normalizeLocale } from '@/locales/set.js'
import Cookies from 'js-cookie'

let timer = null;

const getPreferencesPayload = (result) => (
    result?.preferences ||
    result?.data?.preferences ||
    result?.data ||
    result ||
    {}
)

export const useUserStore = defineStore("userStore", {
    persist: {
        enabled: true,
        strategies: [
            {
                paths: ['isLogin', 'groups']
            }
        ]
    },
    state:() => ({
        isLogin: false,
        showLoginModal: false,
        user: {
            group: {}
        },
        menuPermissions: {},
        token: '',
        groups: [],
        unreadNum: 0
    }),
    getters: {
        userGroup(state) {
            return state.user.group || {};
        },
        inviteUrl(state) {
            if(!state.isLogin) return '';
            return window.location.origin +'/invite?code='+ state.user.invite_code;
        }
    },
    actions: {
        async init() {
            this.isLogin = true;
            await this.getUserInfo();
            await Promise.all([
                this.getMenuPermissions(),
                this.syncPreferences(),
            ]);
            this.getMessageNum();
            useCardStore().init();
        },
        async login(token) {
            Cookies.set(tokenName, token);
            await this.init();
        },
        async syncPreferences() {
            const cachedPreferences = {
                country: getCachedCountry(),
                language: getCachedLocale(),
                timezone: getCachedTimezone(),
            };

            if (
                hasPendingPreferencesSync() &&
                Object.values(cachedPreferences).every(Boolean)
            ) {
                try {
                    await userApi.savePreferences(cachedPreferences);
                    clearPreferencesPendingSync();
                    applyPreferences(cachedPreferences);
                } catch {
                    // 偏好同步失败时保留待同步状态和当前浏览器偏好。
                }
                return;
            }

            try {
                const result = await userApi.getPreferences();
                const preferences = getPreferencesPayload(result);
                applyPreferences({
                    country: normalizeCountry(preferences.country) || DEFAULT_COUNTRY,
                    language: normalizeLocale(preferences.language) || DEFAULT_LOCALE,
                    timezone: normalizeTimezone(preferences.timezone) || DEFAULT_TIMEZONE,
                });
            } catch {
                // 获取失败时保留当前浏览器偏好，不影响用户正常登录。
            }
        },
        logout() {
            this.isLogin = false;
            this.user = {};
            this.menuPermissions = {};
            Cookies.remove(tokenName)
        },
        showModal() {
            this.showLoginModal = true;
        },
        async getUserInfo() {
            await userApi.getUserInfo().then(res => {
                this.user = res || {};
            }).catch(() => {
                // err
            })
        },
        async getMenuPermissions() {
            await userApi.getSecuritySettings().then(res => {
                const data = (res?.code === 1 ? res.data : res) || {};
                this.menuPermissions = {
                    allow_account: Boolean(data.allow_account),
                    allow_api: Boolean(data.allow_api),
                    is_cashback: Boolean(data.is_cashback),
                    is_invite_cashback: Boolean(data.is_invite_cashback),
                };
            }).catch(() => {
                this.menuPermissions = {};
            })
        },
        async getMessageNum() {
            timer && clearTimeout(timer);
            timer = null;
            if(!this.isLogin) return false;
            await userApi.getMessageNum().then(res => {
                this.unreadNum = res || 0;
            }).catch(() => {
                // err
            })
            if(this.isLogin) {
                timer = setTimeout(() => {
                    this.getMessageNum();
                }, 1000 * 30)
            }
        }
    }
})
