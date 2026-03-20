<template>
	<view>
		{{uuid}}
	</view>
</template>

<script setup>
	import {
		onShow,
		onLoad,
		onUnload
	} from "@dcloudio/uni-app"
	import {
		onUnmounted
	} from 'vue'
	import {
		initConnection,
		getAvailableItems,
		endConnection,
		getItems,
		disable,
		buyProduct,
		finishTransaction,
		getPendingTransactions,
		isEligibleForIntroOffer,
		subscriptionStatus,
		currentEntitlement,
		latestTransaction,
		showManageSubscriptions
	} from '@/uni_modules/sn-uts-iap'
	// 初始化连接
	const isConnected = initConnection()
	if (isConnected) {
		console.log('成功连接到 App Store')
	} else {
		console.log('无法连接到 App Store')
	}
		console.log(crypto)
		var array = new Uint32Array(10);
		const uuid = crypto.getRandomValues(array)
	// 应用退出时清理
	onUnload(() => {
		endConnection()
		disable()
	})
	onLoad(() => {

		getItems(['dy1'], (result) => {
			if (result.code === 0) {
				const products = result.data.products
				console.log('产品信息:', products)

				products.forEach(product => {
					console.log(`产品ID: ${product.id}`)
					console.log(`产品名称: ${product.displayName}`)
					console.log(`产品价格: ${product.displayPrice}`)
					console.log(`产品类型: ${product.type}`)
				})
			} else {
				console.log('获取产品信息失败')
			}
		})

		// 获取待处理交易
		getPendingTransactions((result) => {
			if (result.code === 0) {
				const transactions = result.data.transactions
				console.log('待处理交易:', transactions)

				// 完成所有待处理交易
				transactions.forEach(transaction => {
					finishTransaction(transaction.transactionId)
				})
			}
		})
		// 获取订阅状态
		subscriptionStatus('dy1', (result) => {
			if (result.code === 0) {
				const status = result.data.status
				console.log('订阅状态:', status, result)

				status.forEach(s => {
					console.log(`状态: ${s.state}`)
					console.log(`平台: ${s.platform}`)
				})
			}
		})
		// 获取当前权益
		currentEntitlement('dy1', (result) => {
			if (result.code === 0) {
				const entitlement = result.data
				console.log('当前权益:', entitlement)
			}
		})
		// 获取最新交易
		latestTransaction('dy1', (result) => {
			if (result.code === 0) {
				const transaction = result.data
				console.log('最新交易:', transaction)
			}
		})
		// 显示订阅管理界面
		// showManageSubscriptions((result) => {
		// 	if (result.code === 0) {
		// 		const success = result.data.success
		// 		console.log('订阅管理界面显示结果:', success)
		// 	}
		// })
		

	})
</script>

<style>

</style>