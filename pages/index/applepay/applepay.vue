<template>
	<view class="content">
		<view class="uni-list">
			<radio-group @change="applePriceChange">
				<label class="uni-list-cell" v-for="(item, index) in productList" :key="index">
					<radio :value="item.productid" :checked="item.checked" />
					<view class="price">{{item.title}} {{item.price}}元</view>
				</label>
			</radio-group>
		</view>
		<view class="uni-padding-wrap">
			<button class="btn-pay" @click="createOrder" :loading="loading" :disabled="disabled">立即支付</button>
		</view>

		<!-- 统一支付组件，注意：vue3下ref不可以等于组件名，因此这里ref="pay" 而不能是 ref="uniPay" -->
		<uni-pay ref="pay" :debug="true" :adpid="adpid" return-url="/pages/order-detail/order-detail"
			@mounted="onMounted" @success="onSuccess"></uni-pay>
	</view>
</template>

<script>
	import {
		initConnection,
		endConnection,getItems,
		disable,getPendingTransactions
	} from '@/uni_modules/sn-uts-iap'
	// 初始化连接
	const isConnected = initConnection()
	if (isConnected) {
		console.log('成功连接到 App Store')
	} else {
		console.log('无法连接到 App Store')
	}

	export default {
		data() {
			const userInfo = uniCloud.getCurrentUserInfo();
			const dateObj = new Date()
			const time = dateObj.getTime()

			const orderNo = "d-" + time;
			return {
				order_no: orderNo, // 业务系统订单号（即你自己业务系统的订单表的订单号）
				out_trade_no: orderNo + '-wor-' + userInfo.uid, // 插件支付单号
				// adpid: "1000000001", // uni-ad的广告位id

				loading: false, // 支付按钮是否在loading中
				disabled: true, // 支付按钮是否禁用
				productid: "wor", // 用户选择的商品id
				// 出售的ios内购商品列表
				productList: [{
					"description": "wor排气声浪",
					"price": 12,
					"productid": "wor",
					"title": "wor排气声浪"
				}],
			}
		},
		onUnload() {
			endConnection()
			    disable()
		},
		onLoad: function() {
			// 初始化连接
			const isConnected = initConnection()
			if (isConnected) {
				console.log('成功连接到 App Store')
				
				// 获取指定产品信息
				getItems(['wor'], (result) => {
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
				
			} else {
				console.log('无法连接到 App Store')
			}

		},
		onShow() {
			// if (this.$refs.pay && this.$refs.pay.appleiapRestore) {
			// 	// ios内购支付漏单重试
			// 	this.$refs.pay.appleiapRestore();
			// }
		},
		onUnload() {},
		methods: {
			// 支付组件加载完毕后执行
			onMounted(insideData) {
				this.init();
			},
			// 初始化
			async init() {
				this.productList[0].checked = true;
				this.productid = this.productList[0].productid;
				this.disabled = false;
				if (this.$refs.pay && this.$refs.pay.appleiapRestore) {
					// ios内购支付漏单重试
					this.$refs.pay.appleiapRestore();
				}
			},
			/**
			 * 发起支付
			 * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
			 */
			createOrder() {
				this.order_no = `test` + Date.now();
				this.out_trade_no = this.order_no;
				// 发起支付
				this.$refs.pay.createOrder({
					provider: "appleiap", // 支付供应商（这里固定未appleiap，代表ios内购支付）
					order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
					out_trade_no: this.out_trade_no, // 插件支付单号
					type: "appleiap", // 支付回调类型（可自定义，建议填写appleiap）
					productid: this.productid, // ios内购产品id（仅ios内购生效）
					custom: {}, // 自定义数据（此参数不推荐使用，因为是前端传的，此参数可能会被伪造，建议通过order_no查询自己业务订单表来获取自定义业务数据）
				});
			},
			// 监听事件 - 支付成功
			onSuccess(res) {
				console.log('success: ', res);
				if (res.user_order_success) {
					// 代表用户已付款，且你自己写的回调成功并正确执行了

				} else {
					// 代表用户已付款，但你自己写的回调执行失败（通常是因为你的回调代码有问题）

				}
			},

			// 监听-多选框选中的值改变
			applePriceChange(e) {
				this.productid = e.detail.value;
			},
		}
	}
</script>

<style>
	.content {
		padding: 15px;
	}

	button {
		background-color: #007aff;
		color: #ffffff;
	}

	.uni-list-cell {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px;
		border-bottom: 1px solid #eee;
	}

	.price {
		margin-left: 10px;
	}

	.btn-pay {
		margin-top: 30px;
	}
</style>