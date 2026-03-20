<template>
	<view>
		<view class="card">
			<view class="main" :style="{backgroundImage:'url('+banner+')'}">
				{{weChat}}
			</view>
			<view class="mt-3 flex align-center justify-center">
					<!-- <button class="btn clearButtonstyle" style="margin: 0;" open-type="share">分享</button> -->
			</view>
			<view class="content">
				<view class="">
					注意事项
				</view>
				<view class="mt-3">
					{{content}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { api,host1 }  from '@/utils/api.js'
	import getData from '@/utils/getData';
	
	export default {
		data() {
			return {
				balance:0,//余额
				shareImg:'',//分享图片
				shareTitle:'',//分享标题
				content:'',//注意事项
				weChat:'',//技工微信
				banner:''//背景
			}
		},
		onShow() {
			// this.getUserInfo()
			this.getSystem()
		},
		onShareAppMessage() {
			return{
				title:this.shareTitle,
				path:'/pages/index/index?pId='+uni.getStorageSync('userId'),
				imageUrl:this.shareImg,
			}
		},
		methods: {
			getSystem(){
				console.log(api.system,host1,'111111')
				let param = {
					API_URL: api.system,
					method: 'get'
				};
				getData.result(param).then((res) => {
					console.log(res,'系统设置');
					this.shareImg=host1+res.data.data.friend.share_image
					this.shareTitle=res.data.data.friend.share_text
					this.banner=host1+res.data.data.friend.subpage_image
					this.content=res.data.data.friend.subpage_text
					this.weChat='WOR 车友娇儿联系方式：1347664940'
					console.log(this.banner,'this.bannerthis.banner')
				})
			}
		}
	}
</script>

<style>
page {
	background-color: #000000;
}
.clearButtonstyle {
    background: none;
    border-radius: 0;
    padding: 0;
    margin: 0 !important;
    line-height: 1;
    font-weight: normal;
    outline: none;
}
 
.clearButtonstyle::after {
    border: none;
}
.card{
	width: 690rpx;
	min-height: 800rpx;
	background-color: #FFFFFF;
	border-radius: 15rpx;
	margin: 30rpx auto;
	padding: 16rpx;
	box-sizing: border-box;
}
.main{
	width: 100%;
	height: 153rpx;
	line-height: 153rpx;
	margin-bottom: 20rpx;
	text-align: center;
	font-size: 30rpx;
	font-family: Microsoft YaHei;
	font-weight: 400;
	color: #FFFFFF;
	/* background: #000000; */
	/* background: url('https://shenglang1.zhongqi.pro/upload/images/1355-e2d4814e-618ce7ae760bf827837102.png'); */
	background-repeat: no-repeat;
	background-size: 100% 153rpx;
	border-radius: 15rpx;
}
.left{
	width: 343rpx;
	height: 136rpx;
	line-height: 136rpx;
	text-align: center;
	font-size: 50rpx;
	font-family: Microsoft YaHei;
	font-weight: 400;
	background-color: #000000;
	border-radius: 15rpx;
	color: #FFFFFF;
}
.right{
	width: 343rpx;
	height: 136rpx;
	margin-left: 16rpx;
}
.btn{
	width: 100%;
	height: 60rpx;
	line-height: 60rpx;
	text-align: center;
	background: #000000;
	border-radius: 8rpx;
	font-size: 30rpx;
	font-family: Microsoft YaHei;
	font-weight: 400;
	color: #FFFFFF;
}
.content{
	width: 610rpx;
	min-height: 185rpx;
	font-size: 32rpx;
	font-family: Microsoft YaHei;
	font-weight: 400;
	color: #000000;
	margin: 40rpx auto;
}
</style>
