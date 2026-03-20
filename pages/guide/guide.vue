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

    <!-- 使用 cover-view 覆盖在 video 之上 -->
    <cover-view class="content-overlay">
      <!-- 调试时间显示 -->
      <cover-view class="debug-time">
        时间: {{ currentTime.toFixed(2) }}s | 文案索引: {{ currentShownIndex }}
      </cover-view>

      <!-- 文案显示区域（底部） -->
      <cover-view class="copy-container">
        <cover-view v-if="currentCopy" class="copy-text">
          {{ currentCopy }}
        </cover-view>
      </cover-view>

      <!-- 继续按钮 -->
      <cover-view v-if="showButton" class="button-container">
        <cover-view class="continue-btn" @click="onContinue">
          {{ buttonText }}
        </cover-view>
      </cover-view>
    </cover-view>
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
const displayMilestones = [13, 15, 17, 19, 21]

const currentShownIndex = ref(-1)
const hasFinished = ref(false)
const currentTime = ref(0)
const isPlaying = ref(false)
const isPausedAtMilestone = ref(false)
const shouldPlayToEnd = ref(false)
const hideOverlay = ref(false)

const currentCopy = computed(() => {
  if (hideOverlay.value) {
    return ''
  }
  if (currentShownIndex.value >= 0 && currentShownIndex.value < copyLines.length) {
    return copyLines[currentShownIndex.value]
  }
  return ''
})

const showButton = computed(() => {
  return currentShownIndex.value >= 0 && !hasFinished.value && !hideOverlay.value
})

const buttonText = computed(() => {
  return currentShownIndex.value >= copyLines.length - 1 ? '开始体验' : '继续'
})

// 检查是否需要在当前时间暂停 - 极简版本，无 seek
function checkAndPauseAtMilestone(seconds) {
  currentTime.value = seconds
  
  const nextMilestoneIndex = currentShownIndex.value + 1
  if (nextMilestoneIndex < displayMilestones.length) {
    const nextMilestone = displayMilestones[nextMilestoneIndex]
    
    // 容差范围：±0.3s
    const tolerance = 0.3
    const timeDiff = Math.abs(seconds - nextMilestone)
    
    // 到达里程碑时直接暂停，不做任何 seek 操作
    if (timeDiff <= tolerance && isPlaying.value && !isPausedAtMilestone.value && !shouldPlayToEnd.value) {
      console.log(`到达里程碑 ${nextMilestone}s（当前: ${seconds.toFixed(2)}s），显示文案 ${nextMilestoneIndex + 1}`)
      
      currentShownIndex.value = nextMilestoneIndex
      isPausedAtMilestone.value = true
      
      // 直接暂停，无延迟，无 seek
      if (videoContext.value) {
        videoContext.value.pause()
      }
    }
  }
}

function onPlay() {
  isPlaying.value = true
  console.log('视频开始播放')
}

function onPause() {
  isPlaying.value = false
  console.log('视频已暂停')
}

function onTimeUpdate(e) {
  const t = e.detail.currentTime
  checkAndPauseAtMilestone(t)
}

function resumeVideoPlayback() {
  if (!videoContext.value) {
    console.error('videoContext 未初始化')
    return
  }

  isPausedAtMilestone.value = false
  isPlaying.value = true
  videoContext.value.play()
  console.log('视频恢复播放')
}

function onContinue() {
  console.log(`点击继续，文案索引: ${currentShownIndex.value}，时间: ${currentTime.value.toFixed(2)}s`)
  
  if (currentShownIndex.value >= copyLines.length - 1) {
    console.log('点击开始体验，隐藏交互层')
    shouldPlayToEnd.value = true
    hideOverlay.value = true
    
    // 立即恢复播放
    if (videoContext.value) {
      videoContext.value.play()
    }
  } else {
    // 恢复播放到下一个里程碑
    resumeVideoPlayback()
  }
}

function finishGuide() {
  if (hasFinished.value) return
  hasFinished.value = true
  
  if (videoContext.value) {
    videoContext.value.pause()
  }
  
  uni.setStorageSync('hasShownGuide', true)
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function onEnded() {
  console.log('视频播放完成')
  finishGuide()
}

function onVideoError(e) {
  console.error('视频加载错误:', e)
  setTimeout(finishGuide, 2000)
}

onMounted(() => {
  console.log('组件已挂载')
  videoContext.value = uni.createVideoContext('worGuideVideo')
  
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
  object-fit: cover;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* 调试时间显示 */
.debug-time {
  position: absolute;
  top: 60rpx;
  left: 20rpx;
  color: #ffff00;
  font-size: 24rpx;
  background: rgba(0, 0, 0, 0.7);
  padding: 12rpx 18rpx;
  border-radius: 8rpx;
  z-index: 1000;
}

/* 文案容器 */
.copy-container {
  position: absolute;
  bottom: 200rpx;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 40rpx;
  box-sizing: border-box;
  z-index: 100;
}

.copy-text {
  color: #000000;
  font-size: 36rpx;
  font-weight: 900;
  text-align: center;
  line-height: 1.6;
  animation: fadeIn 0.5s ease-out forwards;
  text-shadow: 0 2rpx 4rpx rgba(255, 255, 255, 0.3);
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(20rpx); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* 按钮容器 */
.button-container {
  position: absolute;
  bottom: 80rpx;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 60rpx;
  box-sizing: border-box;
  z-index: 100;
}

/* 继续按钮 */
.continue-btn {
  width: 100%;
  max-width: 600rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: #ff0000;
  color: #ffffff;
  border-radius: 50rpx;
  font-size: 36rpx;
  font-weight: bold;
  box-shadow: 0 10rpx 30rpx rgba(255, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.continue-btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}
</style>
