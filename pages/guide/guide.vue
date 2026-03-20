<template>
  <view class="guide-container">
    <video
      id="worGuideVideo"
      ref="videoRef"
      class="guide-video"
      :src="videoSrc"
      :controls="false"
      :autoplay="false"
      :muted="true"
      :show-center-play-btn="false"
      :enable-progress-gesture="false"
      object-fit="cover"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @error="onVideoError"
    />

    <view class="content-overlay">
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
        <view class="primary-btn" @click="onContinue">
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

// 每条文案对应的视频播放节点（秒）
const displayMilestones = [3, 6, 9, 12, 15]

const currentShownCount = ref(0)
const hasFinished = ref(false)
const currentTime = ref(0)
const isPlaying = ref(false)
const isPausedAtMilestone = ref(false)
let checkPauseTimer = null

const visibleCopies = computed(() => {
  return copyLines.slice(0, currentShownCount.value)
})

const showButton = computed(() => {
  return currentShownCount.value > 0 && !hasFinished.value
})

const buttonText = computed(() => {
  return currentShownCount.value >= copyLines.length ? '开始体验' : '继续'
})

// 检查是否需要在当前时间暂停
function checkAndPauseAtMilestone(seconds) {
  currentTime.value = seconds
  
  // 检查是否到达了下一条文案的里程碑
  const nextMilestoneIndex = currentShownCount.value
  if (nextMilestoneIndex < displayMilestones.length) {
    const nextMilestone = displayMilestones[nextMilestoneIndex]
    
    // 如果当前时间接近或超过下一个里程碑，暂停视频并显示文案
    if (seconds >= nextMilestone && isPlaying.value && !isPausedAtMilestone.value) {
      console.log(`到达里程碑 ${nextMilestone}s，暂停视频`)
      isPausedAtMilestone.value = true
      
      // 确保视频停在精确位置
      if (videoContext.value) {
        videoContext.value.seek(nextMilestone)
        // 延迟暂停，确保 seek 完成
        setTimeout(() => {
          if (videoContext.value) {
            videoContext.value.pause()
          }
        }, 100)
      }
    }
  }
}

function onPlay() {
  isPlaying.value = true
  console.log('Video started playing')
}

function onPause() {
  isPlaying.value = false
  console.log('Video paused')
}

function onTimeUpdate(e) {
  const t = e.detail.currentTime
  checkAndPauseAtMilestone(t)
}

function resumeVideoPlayback() {
  console.log('尝试恢复视频播放...')
  
  if (!videoContext.value) {
    console.error('videoContext 未初始化')
    return
  }

  // 多次尝试确保播放指令被执行
  let retryCount = 0
  const maxRetries = 3
  
  const attemptPlay = () => {
    retryCount++
    console.log(`第 ${retryCount} 次尝试播放视频`)
    
    // 先重置状态
    isPausedAtMilestone.value = false
    isPlaying.value = true
    
    // 尝试播放
    videoContext.value.play()
    
    // 如果失败，继续重试
    if (retryCount < maxRetries) {
      setTimeout(attemptPlay, 150)
    }
  }
  
  attemptPlay()
}

function onContinue() {
  console.log(`点击继续，当前显示文案数: ${currentShownCount.value}`)
  
  if (currentShownCount.value >= copyLines.length) {
    // 最后一条文案，点击后进入应用
    finishGuide()
  } else {
    // 显示下一条文案
    currentShownCount.value++
    
    // 恢复视频播放
    setTimeout(() => {
      resumeVideoPlayback()
    }, 100)
  }
}

function finishGuide() {
  if (hasFinished.value) return
  hasFinished.value = true
  
  if (videoContext.value) {
    videoContext.value.pause()
  }
  
  if (checkPauseTimer) {
    clearInterval(checkPauseTimer)
  }
  
  uni.setStorageSync('hasShownGuide', true)
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function onEnded() {
  console.log('Video ended')
  // 视频播放完成后自动进入
  finishGuide()
}

function onVideoError(e) {
  console.error('Video Error:', e)
  // 如果视频加载失败，直接进入应用，避免卡死在引导页
  setTimeout(finishGuide, 2000)
}

onMounted(() => {
  videoContext.value = uni.createVideoContext('worGuideVideo')
  
  // 延迟启动视频播放
  setTimeout(() => {
    if (videoContext.value && !hasFinished.value) {
      console.log('启动视频播放')
      videoContext.value.play()
    }
  }, 500)
})

onUnmounted(() => {
  if (videoContext.value) {
    videoContext.value.pause()
  }
  if (checkPauseTimer) {
    clearInterval(checkPauseTimer)
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
  transition: all 0.2s ease;
}

.primary-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
