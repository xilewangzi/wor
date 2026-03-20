<template>
  <view class="page">
    <view class="title">订阅（占位）</view>

    <view class="card">
      <view class="row">
        <text class="label">月度套餐</text>
        <text class="value">-</text>
      </view>
      <view class="row">
        <text class="label">年度套餐</text>
        <text class="value">-</text>
      </view>
    </view>

    <view class="actions">
      <button type="primary" disabled="true">订阅（后续接入）</button>
    </view>
  </view>
</template>

<script setup>
// 占位页面：具体商品列表/购买流程后续实现
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

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.row:last-child {
  border-bottom: none;
}

.label {
  color: #333;
}
.value {
  color: #999;
}

.actions {
  margin-top: 24rpx;
}
</style>

