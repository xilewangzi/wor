<template>
  <view class="guide-container">
    <video
      id="worGuideVideo"
      class="guide-video"
      :src="videoSrc"
      :controls="false"
      :autoplay="true"
      :muted="true"
      :show-center-play-btn="false"
      @play="onPlay"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @loadedmetadata="onVideoLoaded"
      @error="onVideoError"
    />

    <view class="content">
      <view class="copies">
        <view v-for="(line, idx) in visibleCopies" :key="idx" class="copy">
          {{ line }}
        </view>
      </view>

      <view v-if="showButton" class="continue-wrap">
        <view class="continue-btn" @click="onContinue" @touchstart="" @touchend="">{{ buttonText }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'

// 你提供的引导视频文案（逐条叠加显示）
const copyLines = [
  '本年度值得升级的汽车软件+（海外媒体报道）',
  '一键开启无需硬件',
  '根据卫星实时真实还原跑车声浪',
  '13 种声浪一次满足（帕加尼、兰博）',
  '真车实录，真响真还原。'
]

// 从第 7 秒开始，每隔 2 秒新增一条文案
const startAt = 7
const stepInterval = 2

const videoSrc = '/static/wor.mp4'

const currentShownCount = ref(0) // 已显示文案条数
const hasFinished = ref(false)

const visibleCopies = computed(() => {
  const copies = copyLines.slice(0, currentShownCount.value)
  console.log('可见文案更新:', {
    total: copyLines.length,
    shown: currentShownCount.value,
    visible: copies.length,
    content: copies
  })
  return copies
})

// 按钮显示逻辑
const showButton = computed(() => {
  const shouldShow = currentShownCount.value > 0 && !hasFinished.value
  console.log('按钮显示状态检查:', {
    currentShownCount: currentShownCount.value,
    hasFinished: hasFinished.value,
    shouldShow: shouldShow
  })
  return shouldShow
})

// 按钮文案逻辑
const buttonText = computed(() => {
  if (currentShownCount.value >= copyLines.length) {
    return '开始体验'
  } else if (currentShownCount.value === 1) {
    return '点击查看下一条'
  } else {
    return '继续'
  }
})

// iOS 上 @timeupdate 可能不稳定：用定时器兜底按“播放经过时间”计算展示节点
let intervalId = null
const playStartTs = ref(null)

function startTickerIfNeeded() {
  if (hasFinished.value) return
  if (intervalId) return

  if (playStartTs.value === null) playStartTs.value = Date.now()

  intervalId = setInterval(() => {
    if (hasFinished.value) return
    if (playStartTs.value === null) return

    const elapsedSeconds = (Date.now() - playStartTs.value) / 1000
    syncByCurTime(elapsedSeconds)
  }, 250)
}

function stopTicker() {
  if (intervalId) clearInterval(intervalId)
  intervalId = null
  playStartTs.value = null
}

function syncByCurTime(cur) {
  if (currentShownCount.value >= copyLines.length) return
  if (cur < startAt) return

  const desiredCount = Math.min(
    copyLines.length,
    Math.floor((cur - startAt) / stepInterval) + 1
  )

  if (desiredCount > currentShownCount.value) {
    console.log('显示文案:', desiredCount, '条，当前时间:', cur, '秒')
    currentShownCount.value = desiredCount
  }
}

function onContinue() {
  console.log('用户点击按钮，当前文案数量:', currentShownCount.value)
  
  if (currentShownCount.value >= copyLines.length) {
    // 最后一条文案，点击后完成引导
    console.log('完成引导，跳转到首页')
    finishGuide()
  } else {
    // 显示下一条文案
    currentShownCount.value++
    console.log('显示下一条文案，当前数量:', currentShownCount.value)
    
    // 如果用户点击过快，重置定时器以确保时间同步
    if (playStartTs.value) {
      playStartTs.value = Date.now() - (startAt + (currentShownCount.value - 1) * stepInterval) * 1000
      console.log('重置定时器时间戳')
    }
  }
}

function finishGuide() {
  if (hasFinished.value) return
  hasFinished.value = true
  stopTicker()

  uni.setStorageSync('hasShownGuide', true)
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function onPlay() {
  console.log('视频开始播放')
  // 视频开始播放后启动定时器
  playStartTs.value = Date.now()
  startTickerIfNeeded()
}

function onVideoLoaded() {
  console.log('视频元数据加载完成')
  // 确保视频开始播放
  const video = document.getElementById('worGuideVideo')
  if (video) {
    video.play().catch(err => {
      console.log('视频播放失败:', err)
    })
  }
}

function onVideoError(e) {
  console.log('视频加载错误:', e)
  console.log('视频路径:', videoSrc)
}

function onTimeUpdate(e) {
  if (hasFinished.value) return

  const t = e?.detail?.currentTime ?? e?.currentTime ?? 0
  const cur = Number(t) || 0
  
  console.log('视频时间更新:', cur, '秒')

  // 同步展示（真正依赖展示节点的还是定时器兜底）
  syncByCurTime(cur)
}

function onEnded() {
  console.log('视频播放结束')
  finishGuide()
}

// fallback：如果 iOS 不触发 @play，也从页面加载后立即启动兜底时间线
setTimeout(() => {
  console.log('启动兜底定时器检查:', {
    hasFinished: hasFinished.value,
    intervalId: intervalId,
    playStartTs: playStartTs.value
  })
  if (!hasFinished.value && !intervalId) {
    console.log('启动兜底定时器')
    startTickerIfNeeded()
  }
}, 1000)

// 添加额外的调试信息
console.log('引导页初始化完成')
console.log('当前状态:', {
  currentShownCount: currentShownCount.value,
  hasFinished: hasFinished.value,
  showButton: showButton.value,
  buttonText: buttonText.value,
  visibleCopies: visibleCopies.value
})

// 添加调试日志，帮助排查问题
console.log('引导页加载完成，视频路径:', videoSrc)
console.log('文案数量:', copyLines.length)
console.log('开始时间:', startAt, '秒，间隔:', stepInterval, '秒')
</script>

<style scoped>
.guide-container {
  height: 100vh;
  background-color: #000;
  position: relative;
}

.guide-video {
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
}

.content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: auto;
}

.copies {
  position: absolute;
  left: 24rpx;
  top: 120rpx;
  width: calc(100% - 48rpx);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  z-index: 9;
}

.copy {
  pointer-events: none;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 14rpx 18rpx;
  font-size: 26rpx;
  line-height: 1.35;
}

.continue-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 110rpx;
  display: flex;
  justify-content: center;
  pointer-events: auto;
  z-index: 200;
}

.continue-btn {
  width: 70%;
  text-align: center;
  padding: 18rpx 0;
  color: #fff;
  background: rgba(221, 43, 57, 0.95);
  border-radius: 999rpx;
  font-weight: 600;
  font-size: 30rpx;
}

</style>

