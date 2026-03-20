<template>
  <view class="video-guide">
    <video
      class="video"
      :src="resolvedSrc"
      :controls="false"
      :autoplay="false"
      :show-center-play-btn="false"
    />

    <!-- 占位：跳过/倒计时/完成回调后续接入 -->
    <view class="skip">跳过（占位）</view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string
  }>(),
  {
    src: '/static/wor.mp4'
  }
)

const resolvedSrc = props.src
</script>

<style scoped>
.video-guide {
  height: 100vh;
  background: #000;
  position: relative;
}

.video {
  width: 100%;
  height: 100%;
}

.skip {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  padding: 10rpx 18rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999rpx;
  font-size: 28rpx;
}
</style>

