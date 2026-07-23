<template>
  <div class="timer-page">
    <div class="timer-card">
      <div class="progress-container">
        <svg viewBox="0 0 100 100" class="progress-svg">
          <circle cx="50" cy="50" r="45" class="circle-bg" />
          <circle cx="50" cy="50" r="45" class="circle-progress"
            :style="{ strokeDashoffset: dashOffset }" />
        </svg>
        <div class="time-display">{{ formatTime }}</div>
      </div>

      <div class="settings-area" v-if="!isRunning">
        <input type="number" v-model="inputMinutes" min="1" class="time-input">
        <span class="unit">分钟</span>
      </div>

      <div class="controls">
        <button v-if="!isRunning || isPaused" @click="startTimer" class="btn btn-start" title="开始">
          ▶️
        </button>
        <button v-if="isRunning && !isPaused" @click="pauseTimer" class="btn btn-pause" title="暂停">
          ⏸️
        </button>
        <button @click="resetTimer" class="btn btn-reset" title="重置">
          🔄
        </button>
      </div>

      <div class="stats-area">
        <div class="count-box">
          <p class="label">已打卡</p>
          <p class="count-value">{{ checkInCount }} <span class="unit">次</span></p>
        </div>
        <button @click="confirmClear" class="btn-clear">清零记录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

// 计时核心逻辑
const inputMinutes = ref(1);
const totalSeconds = ref(60);
const timeLeft = ref(60);
const isRunning = ref(false);
const isPaused = ref(false);
let timer = null;

// 打卡统计（实际项目中应从 userStore 或后端获取）
const checkInCount = ref(Number(localStorage.getItem('运动次数')) || 0);

// SVG 进度条计算
const dashOffset = computed(() => {
  const circumference = 2 * Math.PI * 45; // 圆周长
  const progress = timeLeft.value / totalSeconds.value;
  return circumference * (1 - progress);
});

const formatTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
});

const startTimer = () => {
  if (!isRunning.value) {
    totalSeconds.value = inputMinutes.value * 60;
    timeLeft.value = totalSeconds.value;
    isRunning.value = true;
  }
  isPaused.value = false;
  
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      completeTask();
    }
  }, 1000);
};

const pauseTimer = () => { isPaused.value = true; clearInterval(timer); };

const resetTimer = () => {
  clearInterval(timer);
  isRunning.value = false;
  isPaused.value = false;
  timeLeft.value = inputMinutes.value * 60;
};

const completeTask = () => {
  clearInterval(timer);
  isRunning.value = false;
  checkInCount.value++;
  localStorage.setItem('运动次数', checkInCount.value);
  alert("🎉 目标达成！打卡成功一次！");
};

// 清零功能
const confirmClear = () => {
  const confirmed = window.confirm("🚨 注意：是否确认清零所有打卡记录？此操作不可撤销。");
  if (confirmed) {
    checkInCount.value = 0;
    localStorage.setItem('運動次数', 0);
  }
};

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.timer-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  background-color: var(--color-bg-light, #f8f9fa);
}

.timer-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  text-align: center;
  width: 320px;
}

/* 扇形进度条样式 */
.progress-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
}

.progress-svg { transform: rotate(-90deg); }

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 8;
}

.circle-progress {
  fill: none;
  stroke: #42b883; /* Vue 绿色 */
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s linear;
  stroke-dasharray: 282.7; /* 2 * PI * 45 */
}

.time-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
}

/* 按钮样式 */
.btn {
  border: none;
  background: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 15px;
  transition: transform 0.2s;
}

.btn:hover { transform: scale(1.2); }
.btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* 统计区域 */
.stats-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.count-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #42b883;
}

.btn-clear {
  margin-top: 15px;
  background: none;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 5px 15px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-clear:hover { background: #fff1f0; }

.time-input {
  width: 60px;
  padding: 5px;
  font-size: 1.2rem;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>