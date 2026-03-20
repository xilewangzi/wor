<template>
	<web-view :webview-styles="{height: '0px',width: '100%',border: '1px solid red',position:'absolute',top:'50px'}"
		ref="webview" src="/hybrid/html/local.html" class="webview" @message="handlePostMessage"
		@onPostMessage="handlePostMessage"></web-view>
	<view class="content">
		<view class="successBox" v-if="activationType" @click="cloneActiva">
			<img class="success" src="/static/image/success.gif" alt="">
			<img class="lihe" src="/static/image/lihe.gif" alt="">
			<view class="text">点击车辆，声音放大，链接蓝牙，从速度0开始启动享受声浪!</view>
		</view>
		<!-- 速度展示 -->
		<view class="speedbox speed">
			<image class="speedimg" v-if="speedInKmphValue>0" src="/static/image/speed.gif"
				:class="{speed_add_class: isActive}"></image>

			<view class="speed-text" :class="{speed_add_class: isActive}">{{speedInKmphValue}}</view>
		</view>
		<view class="unlocked mt-2">
			<view class="title" style="font-size: 0.8125rem;letter-spacing: 0;">
				<view>{{isActive?"您已解下列车辆，使用方法在交个朋友详细介绍":"未解锁，请点击激活解锁"}}</view>
				<!-- <view>过期时间：{{expirationDate}}</view> -->
			</view>
			<!-- <view class="noCar" :class="{noCar_add_class: isActive}" v-if="carList.length == 0"
				style="font-size: 0.875rem;">您是第38978位车主，点车购买，用过好评都爆赞
			</view> -->
			<view class="carList flex justify-between" style="position: relative;" @click="toggleEngine(item)"
				:style="{ background: 'url(' + item.image + ')'}" v-for="(item, index) in carList" :key="index">
				<text class="carName ml-4" :class="{carName_add_class: isActive}">{{item.name}}</text>
				<u-icon v-if="!isPlaySound||!(curCar==item)" name="play-circle"
					style='position: absolute;right: 0.9375rem;top: 1.875rem;' color="#ffffff" size="50"></u-icon>
				<u-icon v-else-if="curCar==item&&isPlaySound" name="pause-circle"
					style='position: absolute;right: 0.9375rem;top: 1.875rem;' color="#ffffff" size="50"></u-icon>
				<!-- <van-icon name="volume" v-if='current==index' 
					color="#ffffff" size="30" /> -->
			</view>
		</view>
		<!-- <view class="unlock mt-3 mb-5">
			<view v-if="!isActive">
				<view class="title">
					未解锁
				</view>
			</view>
			<view class="carList position-relative flex align-center justify-between"
				:class="{carList_add_class: isActive}" @click="selCar(item)"
				:style="{ background: 'url(' + item.image + ')' }" v-for="(item, index) in unlockedList" :key="index">
				<text class="carName ml-4" style="color: #FFFFFF;"
					:class="{carName_add_class: isActive}">{{item.name}}</text>
				<view class="bg"
					style="width: 100%;height: 100%;background-color: rgba(0,0,0,0.3);position: absolute;top: 0;left: 0;">
				</view>
			</view>
		</view> -->
		<view class="footercl" :class="{footercl_add_class: isActive}"></view>
		<view class="buttons">
			<view style="display: flex;align-items: center;">

				<view class="activation" @click="showActivation" style="width: 50%;">{{isActive?"已":""}}激活</view>

				<view class="friend" @click="goFriend" style="width: 50%;">
					交个朋友</view>
				<!-- <view class="activation" style="width: 33%;" @tap="goUserCenter">
					个人中心</view> -->
			</view>
		</view>
		<u-popup v-model="activePopup" mode="center" border-radius="12" @close="isActivation = false">
			<view
				style="width:21.875rem;height:5.5rem;border-radius: 0.3125rem; display: flex; flex-direction: column;justify-content: center;">
				<u-button type="primary" :loading="isBuying" @click="showActivation()" style="width: 30%;">激活</u-button>
			</view>
		</u-popup>
		<u-popup v-model="isActivation" mode="center" border-radius="12" @close="isActivation = false">
			<view style="width:21.875rem;height:12.5rem;border-radius: 0.3125rem;">
				<view class="popup_title">填写信息</view>
				<view class="inputBody mt-5" style="box-sizing: border-box;height: 2.8125rem;">
					<view class="flex align-center"
						style="display: flex;align-items: center;justify-content: center;margin-top: 1.875rem;height: 2.8125rem;">
						<view style="width: 20%;display: flex;align-items: center;color: #000;">激活码</view>
						<input type="text" v-model="activation" class="input" placeholder="请输入激活码" />
					</view>
				</view>
				<view class="inputBtn" @click="goActivation()">提交</view>
			</view>
		</u-popup>
		<u-toast ref="uToastRef" />
	</view>
</template>

<script>
	import list from '@/utils/carSounds.js'
	// import {
	// 	store,
	// 	mutations
	// } from '@/uni_modules/uni-id-pages/common/store.js'

	import {
		isProviderEnabled,
		openLocSetting,
		onStartLocs,
		stop,
		requestBackgroundLocPer,
		getLastLocations
	} from "@/uni_modules/xtf-gpslocation"
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
	const sku = 'dy1';
	// const uniIdCo = uniCloud.importObject('uni-id-co')
	// const db = uniCloud.databaseForJQL();
	let player = null;
	var wv;
	export default {
		data() {
			return {
				countGps: 0, //gps调用次数
				activationType: false, //速度获取方式
				isActive: false, //是否激活
				speedInKmphValue: 0, //显示速度 km/h
				speed: 0, //实际速度 m/s
				carList: list,
				activePopup: false,
				curCar: null, //当前选中车辆
				current: null,
				unlockedList: [],
				isLogin: false,
				cardId: null,
				userId: '',
				isPlaySound: false,
				// showPopup: false ,// 控制弹窗显示/隐藏
				isActivation: false, //控制激活码弹框
				isBuying: false,
				expirationDate:''
			}
		},
		onLoad(options) {
			const _this = this;
			const isConnected = initConnection()
			//初始化App Store
			if (isConnected) {
				console.log('成功连接到 App Store')
			} else {
				console.log('无法连接到 App Store')
			}
			//查询订阅状态
			subscriptionStatus(sku, (result) => {
				if (result.code === 0) {
					const status = result.data.status
					console.log('订阅状态:', status, result)

					status.forEach(s => {
						// if (s.state == 1) {
						// 	_this.$refs.uToastRef.show({
						// 		title: '您已订阅',
						// 		duration:1000,
						// 		type: 'success'
						// 	})
						// 	_this.isActive = true;
						// }
						console.log(`状态: ${s.state}`)
						console.log(`平台: ${s.platform}`)
					})
				}
			})
			// 获取当前权益
			currentEntitlement(sku, (result) => {
				if (result.code === 0) {
					const entitlement = result.data
					const now = (new Date()).getTime()
					console.log('当前权益:', entitlement)
					if (entitlement && entitlement.expirationDateIos && now < entitlement.expirationDateIos) {
						_this.$refs.uToastRef.show({
							title: '您已订阅',
							duration: 1000,
							type: 'success'
						})
						_this.isActive = true;
					}
					if (entitlement && entitlement.expirationDateIos) {
						const expirationDate = new Date(entitlement.expirationDateIos)
						_this.expirationDate = expirationDate.toLocaleDateString()+' '+expirationDate.toLocaleTimeString()
					}
				}
			})

			var onGps = isProviderEnabled(); // 是否开启gps
			if (!onGps) {
				openLocSetting(); // 打开gps 设置
			}
			uni.setKeepScreenOn({
				keepScreenOn: true
			});
			requestBackgroundLocPer(); // 申请后台定位权限 无权限则申请，有权限则直接跳过
			setTimeout(() => {
				//获取webview控制声音
				wv = this.$scope.$getAppWebview().children()[0]
				//开启定位及回调
				onStartLocs({
					backgroud: true,
				}, function(loc) {
					// console.log(loc.speed, typeof loc.speed, 45678)
					//gps调用次数更新
					_this.countGps = _this.countGps + 1;
					if (('speed' in loc) && (loc.speed || loc.speed >= 0)) {
						if (loc.speed == -1)
							_this.updateSpeed(loc, 0)
						else {
							_this.updateSpeed(loc, loc.speed)
						}
					} else
						_this.updateSpeed(loc, loc.speed)

				})
			}, 2000)

		},
		onUnload() {
			endConnection()
			disable()
		},
		mounted() {


		},
		methods: {
			updateSpeed(res, speed) {
				this.speed = speed;
				this.speedInKmphValue = Math.floor(speed * 3.6);
				if (wv)
					wv.evalJS(
						`setSpeed(${speed*3.6})`
					)
			},
			toggleEngine(item) {
				console.log(item)
				if (!this.isActive) {
					this.activePopup = true;
					return
				}
				if (this.curCar == item) {
					if (this.isPlaySound) {
						wv.evalJS(`stopEngine()`)
						this.isPlaySound = false;
					} else {
						wv.evalJS(`stopEngine()`)
						wv.evalJS(
							`startEngine("${item.dianuo_wave}","${item.daisu_wave}")`
						)
						this.isPlaySound = true;
					}
				} else {
					wv.evalJS(`stopEngine()`)
					wv.evalJS(
						`startEngine("${item.dianuo_wave}","${item.daisu_wave}")`
					)
					this.isPlaySound = true;
				}
				this.curCar = item;

			},

			goUserCenter() {
				if (!uni.getStorageSync("uni_id_token")) {
					uni.navigateTo({
						"url": "/uni_modules/uni-id-pages/pages/login/login-withpwd"
					})
				} else {
					uni.navigateTo({
						"url": "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
					})
				}
			},
			async goFriend() {

				uni.navigateTo({
					"url": "/pages/friend/friend"
				})
			},
			async showActivation() { //激活弹框
				if (this.isBuying)
					return
				const _this = this;

				// 购买产品
				_this.isBuying = true;
				buyProduct({
					sku: sku, // 产品 SKU
					andDangerouslyFinishTransactionAutomatically: false, // 是否自动完成交易
					// appAccountToken: 'E621E1F8-C36C-495A-93FC-0C247A3E6E51', // 应用账户令牌（可选）, 必须是严格的uuid字符串
					quantity: 1, // 购买数量（可选）
				}, (result) => {
					console.log(result)
					if (result.code === 0) {
						console.log('购买成功:', result.data, result)

						// 手动完成交易：（如果andDangerouslyFinishTransactionAutomatically=true，则不需要手动处理）
						const transactionId = result.data.transactionId

						const success = finishTransaction(transactionId)
						if (success) {

							console.log('交易完成')
							_this.isActive = true;
							_this.$refs.uToastRef.show({
								title: '激活成功',
								type: 'success'
							})

						}
					} else {
						console.log('购买失败，错误码:', result.code)

						// 处理不同的错误状态
						switch (result.code) {
							case -1:
								console.log('用户取消购买')
								_this.$refs.uToastRef.show({
									title: '用户取消购买',
									type: 'error'
								})
								break
							case -2:
								console.log('购买待处理')
								_this.$refs.uToastRef.show({
									title: '购买待处理',
									type: 'error'
								})
								break
							case -3:
								console.log('未知状态')
								_this.$refs.uToastRef.show({
									title: '未知状态',
									type: 'error'
								})
								break
							case -4:
								console.log('购买异常:', result.data.error)
								_this.$refs.uToastRef.show({
									title: '购买异常:' + result.data.error,
									type: 'error'
								})
								break
							case -10:
								console.log('产品未找到')
								_this.$refs.uToastRef.show({
									title: '产品未找到',
									type: 'error'
								})
								break
							default:
								console.log('其他错误')
								_this.$refs.uToastRef.show({
									title: '其他错误',
									type: 'error'
								})
						}
					}
					_this.activePopup = false;
					_this.isBuying = false;
				})




			}
		}
	}
</script>
<style>
	page {
		background-color: transparent !important;
	}

	.content {
		background-color: #4A4A4A !important;
		min-height: 100vh;
		color: #fff;
		width: 100%;
		padding: 5px 16px;
		box-sizing: border-box;
	}

	.successBox {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999999;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.9);
		display: flex;
		justify-content: center;

		.success {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
		}

		.lihe {
			width: 260px;
			height: 260px;
			z-index: 10;
			position: absolute;
			top: 160px;
		}

		.text {
			position: absolute;
			top: 380px;
			color: #fff;
			font-family: serif;
			font-size: 30px;
			font-weight: bold;
			width: 100%;
			height: 100%;
			padding: 0 30px;
			text-shadow:
				-1px -1px 0 #FAA90E,
				1px -1px 0 #FAA90E,
				-1px 1px 0 #FAA90E,
				1px 1px 0 #FAA90E;
			/* 这里的颜色(#000)可以根据需要调整为其他颜色 */

		}
	}

	.speedbox {
		position: relative;
	}

	.speed {
		/* position: sticky; */
		top: 0;
		/* left: 30rpx; */
		/* width: 690rpx; */
		height: 7.8125rem;
		/* z-index: 999; */
		line-height: 7.8125rem;
		text-align: center;
		font-size: 4.6875rem;
		font-weight: bold;
		color: #ffffff;
		background-color: #282828;

		.speedimg {
			position: absolute;
			left: 0;
			top: 0;
			width: 21.5625rem;
			height: 7.8125rem;
		}

		.speed-text {
			position: absolute;
			top: 0;
			left: 0;
			font-size: 20px;
			width: 100%;
			height: 7.8125rem;
			/* z-index: 999; */
			line-height: 7.8125rem;
			text-align: center;
			font-size: 4.6875rem;
			font-weight: bold;
			color: #ffffff;
		}
	}

	.speed_add_class {
		width: 90%;
		height: 3.125rem;
		margin: auto;
		line-height: 3.125rem;
		font-size: 2.5rem;
		/* margin-top: -35px; */
	}

	.unlocked {
		.title {
			text-align: center;
			font-size: 0.9375rem;
			font-family: Microsoft YaHei;
			font-weight: bold;
			color: #ffffff;
			letter-spacing: 0.3125rem;
			margin: 0.625rem 0;
		}

		.carList {
			/* width: 690rpx; */
			height: 160rpx;
			line-height: 160rpx;
			background-size: 100% 100% !important;
			background-repeat: no-repeat;
			margin: 20rpx auto 0;
			border-radius: 5rpx;
			overflow: hidden;
		}

		.noCar {
			width: 21.5625rem;
			height: 5rem;
			line-height: 5rem;
			text-align: center;
			margin: 0.625rem auto 0;
			border-radius: 0.3125rem;
			background-color: #ffffff;
			font-size: 1rem;
			font-family: Microsoft YaHei;
			font-weight: 600;
			color: #000000;
		}

		.carName {
			display: block;
			font-size: 40rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #ffffff;
			text-indent: 50rpx;
		}
	}

	.noCar_add_class {
		width: 90%;
		height: 2.5rem;
		line-height: 2.5rem;
		/* margin: 0.625rem auto 0; */
		margin: auto;
		border-radius: 0.3125rem;
		font-size: 0.5625rem;
	}

	.unlock {
		.carList {
			/* width: 690rpx; */
			height: 160rpx;
			line-height: 160rpx;
			background-size: 100% 100% !important;
			background-repeat: no-repeat;
			margin: 20rpx auto 0;
			border-radius: 5rpx;
			overflow: hidden;
		}

		.carName {
			font-size: 40rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #ffffff;
			text-indent: 50rpx;
		}
	}

	.carList_add_class {
		width: 90%;
		margin: 20rpx auto 0;
		height: 100rpx;
		line-height: 100rpx;
	}

	.footercl {
		height: 200rpx;
		width: 100%;
	}

	.footercl_add_class {
		height: 70rpx;
	}

	.activation_add_class {
		height: 65rpx;
		line-height: 65rpx;
		text-align: center;
		font-size: 19rpx;
	}

	.buttons {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;

		.activation {
			width: 50%;
			height: 106rpx;
			line-height: 106rpx;
			text-align: center;
			background-color: #007BFF;
			color: #ffffff;
			font-size: 36rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			float: left;
			border-right: 1rpx solid #000000;
		}

		.friend {
			width: 50%;
			height: 106rpx;
			line-height: 106rpx;
			text-align: center;
			background-color: #dd2b39;
			color: #ffffff;
			font-size: 36rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			float: right;
		}
	}

	.carName_add_class {
		font-size: 20rpx;
	}

	.popup_title {
		padding: 20rpx 14rpx;
		box-sizing: border-box;
		width: 100%;
		background-color: #000000;
		font-size: 30rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #ffffff;
	}

	.inputBody {
		width: 100%;
		height: 160rpx;
	}

	.inputBtn {
		width: 120rpx;
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		font-size: 26rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #ffffff;
		background-color: #000000;
		margin: 50rpx auto;
		border-radius: 12rpx;
	}

	.input {
		width: 364rpx;
		height: 50rpx;
		line-height: 50rpx;
		padding: 12rpx;
		box-sizing: content-box;
		border: 1rpx solid #000000;
		border-radius: 12rpx;
	}
</style>