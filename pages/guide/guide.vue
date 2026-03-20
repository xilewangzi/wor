<template>
  <view class="guide-container">
    <video
      id="worGuideVideo"
      ref="videoRef"
      class="guide-video"
      :src="videoSrc"
      :controls="false"
      :autoplay="true"
      :muted="true"
      :show-center-play-btn="false"
      :enable-progress-gesture="false"
      object-fit="cover"
      @play="onPlay"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @error="onVideoError"
    />

    <view class="content-overlay" @click="handleScreenClick">
      <view class="copies-list">
        <view 
          v-for="(line, idx) in visibleCopies" 
          :key="idx" 
          class="copy-item animate-fade-in"
        >
          {{ line }}
        </view>
      </view>

      <view v-if="showButton" class="action-area">
        <view class="primary-btn" @click.stop="onContinue">
          {{ buttonText }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const videoSrc = '/static/wor.mp4'
const videoRef = ref(null)
const videoContext = ref(null)

const copyLines = [
  '本年度值得升级的汽车软件+（海外媒体报道）',
  '一键开启无需硬件',
  '根据卫星实时真实还原跑车声浪',
  '13 种声浪一次满足（帕加尼、兰博）',
  '真车实录，真响真还原。'
]

// 配置展示节点（秒）
const displayMilestones = [3, 6, 9, 12, 15] 

const currentShownCount = ref(0)
const hasFinished = ref(false)
const currentTime = ref(0)

const visibleCopies = computed(() => {
  return copyLines.slice(0, currentShownCount.value)
})

const showButton = computed(() => {
  return currentShownCount.value > 0 && !hasFinished.value
})

const buttonText = computed(() => {
  return currentShownCount.value >= copyLines.length ? '开始体验' : '继续'
})

// 核心同步逻辑
function syncContent(seconds) {
  currentTime.value = seconds
  
  // 自动根据时间增加文案数量
  let targetCount = 0
  for (let i = 0; i < displayMilestones.length; i++) {
    if (seconds >= displayMilestones[i]) {
      targetCount = i + 1
    } else {
      break
    }
  }

  if (targetCount > currentShownCount.value) {
    currentShownCount.value = targetCount
  }
}

function onPlay() {
  console.log('Video started playing')
}

function onTimeUpdate(e) {
  const t = e.detail.currentTime
  syncContent(t)
}

function onContinue() {
  if (currentShownCount.value >= copyLines.length) {
    finishGuide()
  } else {
    // 点击继续时，如果还没到下一条的时间，强制显示下一条
    currentShownCount.value++
    
    // 可选：跳转视频进度到对应的里程碑
    const nextTime = displayMilestones[currentShownCount.value - 1]
    if (videoContext.value && currentTime.value < nextTime) {
      videoContext.value.seek(nextTime)
    }
  }
}

function handleScreenClick() {
  // 全屏点击也可以触发继续逻辑，增强交互感
  if (showButton.value) {
    onContinue()
  }
}

function finishGuide() {
  if (hasFinished.value) return
  hasFinished.value = true
  
  uni.setStorageSync('hasShownGuide', true)
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function onEnded() {
  // 视频结束自动进入
  finishGuide()
}

function onVideoError(e) {
  console.error('Video Error:', e)
  // 如果视频加载失败，直接进入应用，避免卡死在引导页
  setTimeout(finishGuide, 2000)
}

onMounted(() => {
  videoContext.value = uni.createVideoContext('worGuideVideo')
  
  // 某些平台 autoplay 可能失效，手动触发
  setTimeout(() => {
    if (videoContext.value) {
      videoContext.value.play()
    }
  }, 500)
})

onUnmounted(() => {
  if (videoContext.value) {
    videoContext.value.pause()
  }
})
</script>

<style scoped>
.guide-container {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

.guide-video {
  width: 100%;
  height: 100%;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.copies-list {
  padding: 120rpx 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20rpx;
}

.copy-item {
  color: #ffffff;
  background: rgba(0, 0, 0, 0.5);
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.action-area {
  position: absolute;
  bottom: 120rpx;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 60rpx;
  box-sizing: border-box;
}

.primary-btn {
  width: 100%;
  max-width: 500rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #dd2b39;
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 20rpx rgba(221, 43, 57, 0.4);
}

.primary-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
