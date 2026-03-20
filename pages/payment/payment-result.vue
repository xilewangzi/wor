<template>
  <view class="page">
    <view class="title">支付结果（占位）</view>
    <view class="content">
      <view class="status">状态：待接入</view>
      <view class="desc">后续将根据支付回调/结果展示成功或失败，并跳转对应页面</view>
    </view>

    <view class="actions">
      <button type="primary" disabled="true">返回首页（后续）</button>
    </view>
  </view>
</template>

<script setup>
// 占位页面：具体状态展示逻辑/跳转后续接入
</script>

<style scoped>
.page {
  padding: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.content {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.status {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.actions {
  margin-top: 24rpx;
}
</style>

