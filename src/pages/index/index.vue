<template>
  <view class="home-container">
    <view class="background"></view>

    <!-- Floating Knowledge Tip -->
    <view class="knowledge-tip" :class="{ 'tip-animate': tipAnimate }" v-if="tipVisible">
      <view class="tip-icon">💡</view>
      <text class="tip-text">{{ currentTip }}</text>
      <view class="tip-close" @click="hideTip">×</view>
    </view>

    <!-- Header -->
    <view class="header-section">
      <view class="user-greeting">
        <text class="hi-text">Hi, {{ currentUser.username || '低碳用户' }}</text>
        <text class="weather-info">{{ todayWeather }}</text>
      </view>
      <view class="carbon-emission">
        <text class="emission-text">今日碳排放</text>
        <text class="emission-value">{{ todayEmission.toFixed(1) }}kg</text>
        <text class="emission-unit">CO₂</text>
      </view>
    </view>

    <!-- Action Buttons -->
    <view class="action-buttons-section">
      <view class="action-button" @click="quickAction('walk')">
        <view class="icon-bg">
          <text class="action-icon">🚶</text> 
        </view>
        <text class="action-text">步行</text>
        <text class="action-count">{{ quickStats.walk }}</text>
      </view>
      <view class="action-button" @click="quickAction('vegetarian')">
        <view class="icon-bg">
          <text class="action-icon">🥗</text> 
        </view>
        <text class="action-text">素食</text>
        <text class="action-count">{{ quickStats.vegetarian }}</text>
      </view>
      <view class="action-button" @click="quickAction('bus')">
        <view class="icon-bg">
          <text class="action-icon">🚌</text> 
        </view>
        <text class="action-text">公交</text>
        <text class="action-count">{{ quickStats.bus }}</text>
      </view>
      <view class="action-button" @click="quickAction('energy')">
        <view class="icon-bg">
          <text class="action-icon">⚡️</text>
        </view>
        <text class="action-text">节电</text>
        <text class="action-count">{{ quickStats.energy }}</text>
      </view>
    </view>

    <!-- Today Tasks Section -->
    <view class="today-tasks-section">
      <view class="section-header">
        <text class="section-title">今日任务</text>
        <text class="section-subtitle" @click="navigateTo('/pages/tasks/tasks')">查看全部 ></text>
      </view>
      <scroll-view class="tasks-scroll" scroll-x="true">
        <view class="task-card" v-for="task in todayTasks" :key="task.taskId" @click="handleTaskAction(task)">
          <view class="task-icon">{{ task.icon }}</view>
          <text class="task-name">{{ task.name }}</text>
          <view class="task-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: task.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ task.progress }}%</text>
          </view>
          <view class="task-reward">
            <text class="reward-text">+{{ task.reward }}积分</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Chart Area -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">本周趋势</text>
        <text class="section-subtitle" @click="navigateTo('/pages/data/data')">详细数据 ></text>
      </view>
      <view class="chart-container">
        <view class="chart-area">
          <view class="chart-bar" v-for="(day, index) in weeklyData" :key="index">
            <view class="bar-fill" :style="{ height: day.percentage + '%', backgroundColor: getBarColor(day.emission) }"></view>
            <text class="bar-value">{{ day.emission.toFixed(1) }}</text>
            <text class="bar-label">{{ day.day }}</text>
          </view>
        </view>
        <view class="chart-summary">
          <text class="summary-text">本周平均: {{ weeklyAverage.toFixed(1) }}kg CO₂</text>
          <text class="summary-comparison" :class="{ positive: weeklyTrend > 0, negative: weeklyTrend < 0 }">
            {{ weeklyTrend > 0 ? '↑' : '↓' }} {{ Math.abs(weeklyTrend).toFixed(1) }}%
          </text>
        </view>
      </view>
    </view>

    <!-- Recommendation Section -->
    <view class="recommendation-section">
      <view class="section-header">
        <text class="section-title">推荐任务</text>
        <text class="section-subtitle">基于您的习惯</text>
      </view>
      <view class="recommendation-card" @click="navigateTo('/pages/tasks/tasks')">
        <view class="rec-icon">{{ recommendedTask.icon }}</view>
        <view class="rec-content">
          <text class="rec-title">{{ recommendedTask.name }}</text>
          <text class="rec-desc">{{ recommendedTask.description }}</text>
          <text class="rec-reward">可获得 {{ recommendedTask.reward }} 积分</text>
        </view>
        <view class="rec-action">
          <text class="action-text">去完成</text>
        </view>
      </view>
    </view>

    <!-- Bottom Navigation -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item" @click="navigateTo('/pages/tasks/tasks')">
        <text class="nav-icon">📋</text>
        <text class="nav-text">任务</text>
      </view>
      <view class="nav-item" @click="navigateTo('/pages/data/data')">
        <text class="nav-icon">📊</text>
        <text class="nav-text">数据</text>
      </view>
      <view class="nav-item" @click="navigateTo('/pages/profile/profile')">
        <text class="nav-icon">🧑</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { AuthManager } from '../../utils/auth.js';
import { CarbonCalculator, CarbonDataManager } from '../../utils/carbonCalculator.js';

export default {
  data() {
    return {
      currentUser: {},
      currentTipIndex: 0,
      tipAnimate: false,
      tipVisible: true,
      tipTimer: null,
      todayEmission: 0,
      todayWeather: '☀️ 晴天 22°C',
      quickStats: {
        walk: 0,
        vegetarian: 0,
        bus: 0,
        energy: 0
      },
      todayTasks: [],
      weeklyData: [],
      weeklyAverage: 0,
      weeklyTrend: 0,
      recommendedTask: {},
      carbonTips: [
        '🌱 选择步行或骑行，每公里可减少约120g CO₂排放',
        '♻️ 垃圾分类回收，每吨废纸可节约17棵树',
        '💡 使用LED灯泡，比白炽灯节能80%以上',
        '🚗 拼车出行，可将交通碳排放减少一半',
        '🌿 种植一棵树，一生可吸收约1吨CO₂',
        '💧 每次洗澡减少2分钟，一年可节约2500升水',
        '📱 延长手机使用寿命1年，可减少85kg CO₂',
        '🏠 调高空调1°C，可节能6-8%',
        '🍽️ 减少食物浪费，全球1/3食物被浪费',
        '🔌 拔掉不用的充电器，待机也会消耗电力'
      ]
    };
  },
  computed: {
    currentTip() {
      return this.carbonTips[this.currentTipIndex];
    }
  },
  onLoad() {
    this.checkAuth();
    this.loadDashboardData();
    this.startTipTimer();
  },
  beforeDestroy() {
    this.clearTipTimer();
  },
  methods: {
    checkAuth() {
      if (!AuthManager.requireAuth()) {
        return;
      }
      this.currentUser = AuthManager.getCurrentUser();
    },
    
    async loadDashboardData() {
      try {
        // 调用API获取首页数据
        const response = await this.$api.getDashboard();
        
        if (response.success) {
          const data = response.data;
          
          // 更新用户信息
          this.currentUser = {
            ...this.currentUser,
            ...data.user
          };
          
          // 更新数据
          this.todayEmission = data.todayEmission || 0;
          this.todayWeather = data.weather || '☀️ 晴天 22°C';
          this.quickStats = data.quickStats || {
            walk: 0,
            vegetarian: 0,
            bus: 0,
            energy: 0
          };
          this.todayTasks = data.todayTasks || [];
          this.weeklyData = data.weeklyData || [];
          this.weeklyAverage = data.weeklyAverage || 0;
          this.weeklyTrend = data.weeklyTrend || 0;
          this.recommendedTask = data.recommendedTask || {};
        } else {
          throw new Error(response.message || '获取数据失败');
        }
      } catch (error) {
        console.error('加载首页数据失败:', error);
        
        // 如果API调用失败，使用本地数据作为备用
        this.loadLocalData();
      }
    },
    
    loadLocalData() {
      // 使用本地数据作为备用
      const dataManager = new CarbonDataManager();
      
      // 加载今日排放数据
      const todayData = dataManager.getTodayData();
      this.todayEmission = todayData.totalEmission;
      
      // 加载快速操作统计
      this.quickStats = {
        walk: todayData.walkCount || 0,
        vegetarian: todayData.vegetarianCount || 0,
        bus: todayData.busCount || 0,
        energy: todayData.energyCount || 0
      };
      
      // 模拟任务数据
      this.todayTasks = [
        {
          taskId: 1,
          name: '步行10000步',
          icon: '🚶‍♂️',
          progress: 75,
          reward: 25,
          status: 'active'
        },
        {
          taskId: 2,
          name: '素食一餐',
          icon: '🥗',
          progress: 0,
          reward: 18,
          status: 'pending'
        },
        {
          taskId: 3,
          name: '公交出行',
          icon: '🚌',
          progress: 100,
          reward: 52,
          status: 'completed'
        }
      ];
      
      // 模拟本周数据
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const emissions = [3.2, 2.8, 4.1, 2.5, 3.7, 2.9, 2.1];
      
      this.weeklyData = days.map((day, index) => ({
        day,
        emission: emissions[index],
        percentage: (emissions[index] / Math.max(...emissions)) * 100
      }));
      
      this.weeklyAverage = emissions.reduce((sum, val) => sum + val, 0) / emissions.length;
      this.weeklyTrend = ((emissions[emissions.length - 1] - emissions[emissions.length - 2]) / emissions[emissions.length - 2]) * 100;
      
      // 模拟推荐任务
      this.recommendedTask = {
        taskId: 10,
        name: '垃圾分类',
        icon: '♻️',
        description: '正确分类生活垃圾，促进资源回收',
        reward: 5
      };
    },
    
    handleTaskAction(task) {
      if (task.status === 'completed') {
        uni.showToast({
          title: '任务已完成',
          icon: 'success'
        });
      } else {
        uni.navigateTo({
          url: '/pages/tasks/tasks?taskId=' + task.taskId
        });
      }
    },
    
    async quickAction(type) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await this.$api.quickAction({
          actionType: type,
          value: 1,
          date: today
        });
        
        if (response.success) {
          // 更新本地统计
          this.quickStats[type]++;
          
          // 更新排放数据
          if (response.data.carbonSaved) {
            this.todayEmission = Math.max(0, this.todayEmission - response.data.carbonSaved);
          }
          
          uni.showToast({
            title: `记录成功，减排${response.data.carbonSaved}kg`,
            icon: 'success'
          });
        } else {
          throw new Error(response.message || '记录失败');
        }
      } catch (error) {
        console.error('快速记录失败:', error);
        
        // 使用本地记录作为备用
        this.recordLocalAction(type);
      }
    },
    
    recordLocalAction(type) {
      // 本地记录备用逻辑
      const dataManager = new CarbonDataManager();
      const today = new Date().toISOString().split('T')[0];
      
      // 更新本地统计
      this.quickStats[type]++;
      
      // 记录到本地存储
      dataManager.addQuickAction(type, today);
    },
    
    getBarColor(emission) {
      if (emission < 2.5) return '#4CAF50';
      if (emission < 3.5) return '#FFC107';
      return '#FF5722';
    },
    
    navigateTo(url) {
      // 对于底部导航，使用 redirectTo 替换当前页面，避免页面栈溢出
      // 对于其他导航，使用 navigateTo
      if (url.includes('/pages/tasks/tasks') || url.includes('/pages/data/data') || url.includes('/pages/profile/profile')) {
        uni.redirectTo({ url });
      } else {
        uni.navigateTo({ url });
      }
    },
    
    startTipTimer() {
      this.tipTimer = setInterval(() => {
        this.nextTip();
      }, 5000);
    },
    
    clearTipTimer() {
      if (this.tipTimer) {
        clearInterval(this.tipTimer);
        this.tipTimer = null;
      }
    },
    
    nextTip() {
      if (!this.tipVisible) return;
      
      this.tipAnimate = true;
      setTimeout(() => {
        this.currentTipIndex = (this.currentTipIndex + 1) % this.carbonTips.length;
        this.tipAnimate = false;
      }, 300);
    },
    
    hideTip() {
      this.tipVisible = false;
      this.clearTipTimer();
    }
  }
};
</script>

<style lang="scss">
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-bottom: 120rpx; // Space for bottom nav

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, #aed581, #558b2f);
    z-index: -1;
  }

  .knowledge-tip {
    position: fixed;
    top: 20rpx;
    left: 20rpx;
    right: 20rpx;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.90));
    backdrop-filter: blur(10rpx);
    border-radius: 15rpx;
    padding: 20rpx 25rpx;
    box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    border: 2rpx solid rgba(76, 175, 80, 0.3);
    transition: all 0.3s ease;

    &.tip-animate {
      transform: scale(1.02);
      box-shadow: 0 12rpx 35rpx rgba(0, 0, 0, 0.2);
    }

    .tip-icon {
      font-size: 32rpx;
      margin-right: 15rpx;
      animation: pulse 2s infinite;
    }

    .tip-text {
      flex: 1;
      font-size: 26rpx;
      color: #2E7D32;
      font-weight: 500;
      line-height: 1.4;
    }

    .tip-close {
      font-size: 36rpx;
      color: #999;
      font-weight: bold;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
      
      &:active {
        color: #666;
      }
    }
  }

  .header-section {
    padding: 40rpx;
    color: #fff;
    text-align: left;
    margin-top: 120rpx; // Increased to account for knowledge tip

    .user-greeting {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;

      .hi-text {
        font-size: 48rpx;
        font-weight: bold;
      }
      .weather-info {
        font-size: 32rpx;
        margin-left: 15rpx;
      }
    }

    .carbon-emission {
      font-size: 32rpx;
      .emission-text {
        font-weight: bold;
      }
      .emission-value {
        font-size: 36rpx;
        font-weight: bold;
      }
      .emission-unit {
        font-size: 28rpx;
      }
    }
  }

  .action-buttons-section {
    display: flex;
    justify-content: space-around;
    padding: 30rpx 20rpx;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 20rpx 30rpx;
    border-radius: 20rpx;

    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;

      .icon-bg {
        width: 100rpx;
        height: 100rpx;
        border-radius: 15rpx; 
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10rpx;
        .action-icon {
          font-size: 50rpx;
        }
      }
      .action-text {
        font-size: 24rpx;
      }
      .action-count {
        font-size: 22rpx;
        color: #999;
      }
    }
  }

      .today-tasks-section {
      padding: 0 30rpx;
      margin-top: 30rpx;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .section-title {
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
        }
        .section-subtitle {
          font-size: 28rpx;
          color: #4CAF50;
          font-weight: bold;
        }
      }

      .tasks-scroll {
        white-space: nowrap;
        overflow-x: auto;
        padding: 10rpx 0;
      }

      .task-card {
        display: inline-block;
        width: 200rpx;
        margin-right: 20rpx;
        padding: 20rpx;
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 15rpx;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10rpx);

        .task-icon {
          font-size: 36rpx;
          margin-bottom: 10rpx;
          display: block;
        }
        .task-name {
          font-size: 28rpx;
          color: #fff;
          margin-bottom: 10rpx;
          font-weight: bold;
        }
        .task-progress {
          margin-bottom: 10rpx;
          .progress-bar {
            height: 8rpx;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 4rpx;
            overflow: hidden;
            margin-bottom: 5rpx;
            .progress-fill {
              height: 100%;
              background-color: #4CAF50;
              border-radius: 4rpx;
            }
          }
          .progress-text {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.8);
          }
        }
        .task-reward {
          .reward-text {
            font-size: 24rpx;
            color: #4CAF50;
            font-weight: bold;
          }
        }
      }
    }

      .chart-section {
      padding: 0 30rpx;
      margin-top: 30rpx;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .section-title {
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
        }
        .section-subtitle {
          font-size: 28rpx;
          color: #4CAF50;
          font-weight: bold;
        }
      }

      .chart-container {
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 20rpx;
        padding: 20rpx;
        backdrop-filter: blur(10rpx);

        .chart-area {
          height: 200rpx;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20rpx;
          padding: 0 10rpx;

          .chart-bar {
            flex: 1;
            margin: 0 2rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            
            .bar-fill {
              width: 30rpx;
              min-height: 20rpx;
              border-radius: 15rpx 15rpx 0 0;
              margin-bottom: 10rpx;
            }
            .bar-value {
              font-size: 20rpx;
              color: #fff;
              margin-bottom: 5rpx;
              font-weight: bold;
            }
            .bar-label {
              font-size: 20rpx;
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }

        .chart-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15rpx;
          border-top: 1rpx solid rgba(255, 255, 255, 0.1);
          
          .summary-text {
            font-size: 28rpx;
            color: #fff;
          }
          .summary-comparison {
            font-size: 24rpx;
            font-weight: bold;
            &.positive {
              color: #FF5722;
            }
            &.negative {
              color: #4CAF50;
            }
          }
        }
      }
    }

      .recommendation-section {
      padding: 0 30rpx;
      margin-top: 30rpx;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .section-title {
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
        }
        .section-subtitle {
          font-size: 28rpx;
          color: rgba(255, 255, 255, 0.7);
          font-weight: normal;
        }
      }

      .recommendation-card {
        display: flex;
        align-items: center;
        padding: 20rpx;
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 15rpx;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10rpx);

        .rec-icon {
          font-size: 36rpx;
          margin-right: 15rpx;
        }
        .rec-content {
          flex: 1;
          .rec-title {
            font-size: 28rpx;
            color: #fff;
            font-weight: bold;
            margin-bottom: 5rpx;
          }
          .rec-desc {
            font-size: 24rpx;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 5rpx;
          }
          .rec-reward {
            font-size: 22rpx;
            color: #4CAF50;
            font-weight: bold;
          }
        }
        .rec-action {
          padding: 12rpx 24rpx;
          background: linear-gradient(45deg, #4CAF50, #66BB6A);
          border-radius: 20rpx;
          box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.3);
          .action-text {
            font-size: 24rpx;
            color: #fff;
            font-weight: bold;
          }
        }
      }
    }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 110rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 10;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #777;

      .nav-icon {
        font-size: 40rpx;
        margin-bottom: 5rpx;
      }
      .nav-text {
        font-size: 22rpx;
      }
      &.active {
        color: #4CAF50;
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
