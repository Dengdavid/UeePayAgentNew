<template>
	<div class="not-found">
		<!-- 背景装饰元素 -->
		<div class="background">
			<div class="bg-circle bg-circle-1"></div>
			<div class="bg-circle bg-circle-2"></div>
		</div>

		<!-- 主要内容 -->
		<div class="content">
			<!-- 404数字 -->
			<h1 class="error-code">451</h1>

			<!-- 提示信息 -->
			<div class="text">
				<p>{{ $t('exception.ipRestricted') }}</p>
				<p class="primary">{{ userIp }}</p>
			</div>

			<!-- 返回按钮 -->
			<div @click="goBack" class="back-button">
				{{ $t('exception.backHome') }}
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, nextTick } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { useUserStore } from '@/store/user.js'
	import { useAppStore } from '@/store/app.js'
	import Cookies from 'js-cookie'
	const userStore = useUserStore();
	const appStore = useAppStore();
	const route = useRoute();
	const router = useRouter();

	// 响应式数据：当前路径
	const userIp = ref('');
	const goBack=async ()=>{
		// 仅在用户主动重新检测时清除旧标记；仍受限时接口会重新写入。
		localStorage.removeItem("USERID");
		const token = Cookies.get('token');
		if(token) {
			await userStore.init();
		}
		 // 应用初始化
    	await appStore.init();
		const userIp = localStorage.getItem("USERID");
		if(!userIp){
			router.push({name: 'home'});
		}
	}
	onMounted(() => {
		userIp.value = localStorage.getItem("USERID");
	});
</script>

<style scoped lang="less">
.text{
	color: var(--ui-color-text-secondary);
	font-size: 16px;
	>*{
		&:not(:last-child){
			margin-bottom: 8px;
		}
	}
	.primary{
		color:#2563eb;
	}
}
.not-found {
	min-height: 100vh;
	width: 100%;
	position: relative;
	overflow: hidden;
	background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #fff0f7 100%);
}

.background {
	position: absolute;
	inset: 0;
	overflow: hidden;
}

.bg-circle {
	position: absolute;
	border-radius: var(--ui-radius-circle);
	filter: blur(50px);
}

.bg-circle-1 {
	top: -30%;
	left: -10%;
	width: 70%;
	height: 70%;
	background: rgba(59, 130, 246, 0.1);
}

.bg-circle-2 {
	bottom: -30%;
	right: -10%;
	width: 70%;
	height: 70%;
	background: rgba(236, 72, 153, 0.1);
}

.content {
	position: relative;
	z-index: 10;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: var(--ui-padding-0-16);
}

.error-code {
	font-size: 150px;
	font-weight: 700;
	line-height: 1;
	margin: 0;
	background: linear-gradient(to right, #2563eb, #60a5fa);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.title {
	margin-top: 2rem;
	font-size: 1.875rem;
	font-weight: 600;
	color: var(--ui-color-neutral-900);
}

.description {
	margin-top: 1rem;
	color: var(--ui-color-neutral-800);
	max-width: 28rem;
}

.back-button {
	display: inline-block;
	cursor: pointer;
	margin-top: 2rem;
	padding: var(--ui-padding-0_75rem-2rem);
	font-weight: 500;
	color: var(--ui-color-text-inverse);
	background: linear-gradient(to right, #2563eb, #3b82f6);
	border-radius: var(--ui-radius-lg);
	text-decoration: none;
	transition: all 0.2s;
	box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.back-button:hover {
	transform: translateY(-1px);
	box-shadow: 0 15px 20px -3px rgba(59, 130, 246, 0.4);
}

.cards {
	margin-top: 4rem;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 2rem;
	max-width: 64rem;
}

@media (min-width: 768px) {
	.cards {
		grid-template-columns: repeat(4, 1fr);
	}
}

.card {
	padding: var(--ui-padding-24);
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(8px);
	border-radius: var(--ui-radius-2xl);
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-icon {
	font-size: 2.5rem;
	margin-bottom: 0.75rem;
}

.card-text {
	font-size: 0.875rem;
	color: var(--ui-color-neutral-800);
}
</style>
