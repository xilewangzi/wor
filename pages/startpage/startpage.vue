<template>
	<view style="height: 100%;background: url('./static/worstart.png') no-repeat;background-size: cover;background-position: center;">
		<view v-if="!hasNet" style="color:red;">无网络连接</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue';
	import {
	    onLoad,
	    onShow
	  } from "@dcloudio/uni-app";
	const hasNet = ref(false)

	onLoad(()=>{
		uni.getNetworkType({
			success(res) {
				if(res.networkType!='none'){
					hasNet.value = true;
					
					// 检查是否是首次启动
					const hasShownGuide = uni.getStorageSync('hasShownGuide')
					console.log('是否已显示引导页:', hasShownGuide)
					
					if (hasShownGuide) {
						// 非首次启动，直接跳转到首页
						uni.navigateTo({
							url:"/pages/index/index"
						})
					} else {
						// 首次启动，跳转到引导页
						uni.navigateTo({
							url:"/pages/guide/guide"
						})
					}
				}
			}
		})
		uni.onNetworkStatusChange(function (res) {
			console.log(res.isConnected);
			if(res.isConnected){
				hasNet.value = true
				
				// 检查是否是首次启动
				const hasShownGuide = uni.getStorageSync('hasShownGuide')
				
				if (hasShownGuide) {
					// 非首次启动，直接跳转到首页
					uni.navigateTo({
						url:"/pages/index/index"
					})
				} else {
					// 首次启动，跳转到引导页
					uni.navigateTo({
						url:"/pages/guide/guide"
					})
				}
			}else{
				
			}

		});
	})
</script>

<style>
	       
</style>
