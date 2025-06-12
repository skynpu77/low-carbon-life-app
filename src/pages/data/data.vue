<template>
  <view class="data-container">
    <view class="background"></view>

    <!-- Custom Navigation Bar -->
    <view class="custom-nav-bar">
      <view class="back-button" @click="goBack">
        <text class="icon">‹</text>
      </view>
      <text class="nav-title">碳足迹数据</text>
      <view class="action-button" @click="goToCarbonTracker">
        <text class="action-text">+</text>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view class="content-scroll" scroll-y="true">
      <!-- API状态提示 -->
      <view class="api-status" v-if="!apiAvailable">
        <text class="status-icon">📱</text>
        <text class="status-text">离线模式</text>
      </view>

      <!-- 总览卡片 -->
      <view class="overview-card">
        <view class="overview-item">
          <text class="overview-number">{{ carbonData.today.toFixed(1) }}</text>
          <text class="overview-label">今日排放(kg)</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-item">
          <text class="overview-number">{{ carbonData.thisMonth.toFixed(1) }}</text>
          <text class="overview-label">本月排放(kg)</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-item">
          <text class="overview-number">{{ carbonData.reduction.toFixed(1) }}</text>
          <text class="overview-label">减排量(kg)</text>
        </view>
      </view>

      <!-- 环保等级卡片 -->
      <view class="level-card">
        <view class="level-icon">{{ carbonData.level.icon }}</view>
        <view class="level-info">
          <text class="level-title">{{ carbonData.level.level }}</text>
          <text class="level-desc">{{ carbonData.level.description }}</text>
        </view>
        <view class="level-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: carbonData.level.progress + '%' }"></view>
          </view>
          <text class="progress-text">{{ carbonData.level.progress }}%</text>
        </view>
      </view>

      <!-- 本周趋势 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">本周趋势</text>
          <text class="section-subtitle">过去7天碳排放情况</text>
        </view>
        <view class="chart-card">
          <view class="trend-chart">
            <view class="chart-area">
              <view class="chart-line" :style="{ backgroundImage: generateLineChart() }"></view>
              <view 
                v-for="(point, index) in chartData" 
                :key="index"
                class="data-point"
                :class="{ active: index === chartData.length - 1 }"
                :style="{ 
                  left: (index * 14.28) + 7.14 + '%', 
                  top: calculatePointPosition(point.emission) + '%' 
                }"
                @click="showDayDetail(point)"
              >
                <text class="point-value">{{ point.emission.toFixed(1) }}</text>
              </view>
            </view>
            <view class="chart-labels">
              <text 
                v-for="(point, index) in chartData" 
                :key="index"
                class="chart-label"
              >
                {{ formatDate(point.date) }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 活动分布 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">活动分布</text>
          <text class="section-subtitle">各类活动碳排放占比</text>
        </view>
        <view class="activity-grid">
          <view 
            v-for="(activity, index) in activityData" 
            :key="index"
            class="activity-card"
            @click="showActivityDetail(activity)"
          >
            <view class="activity-icon">{{ activity.icon }}</view>
            <text class="activity-name">{{ activity.name }}</text>
            <text class="activity-value">{{ activity.emission.toFixed(1) }}kg</text>
            <view class="activity-bar">
              <view 
                class="activity-progress"
                :style="{ width: activity.percentage + '%' }"
              ></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 月度对比 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">月度对比</text>
          <text class="section-subtitle">近3个月碳排放对比</text>
        </view>
        <view class="month-comparison">
          <view 
            v-for="(month, index) in monthlyComparison" 
            :key="index"
            class="month-item"
          >
            <view class="month-bar">
              <view 
                class="month-progress"
                :style="{ height: month.percentage + '%' }"
              ></view>
            </view>
            <text class="month-value">{{ month.emission.toFixed(0) }}</text>
            <text class="month-label">{{ month.name }}</text>
          </view>
        </view>
      </view>

      <!-- 减排建议 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">减排建议</text>
          <text class="section-subtitle">基于您的数据分析</text>
        </view>
        <view class="suggestions">
          <view 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-card"
          >
            <view class="suggestion-icon">{{ suggestion.icon }}</view>
            <view class="suggestion-content">
              <text class="suggestion-title">{{ suggestion.title }}</text>
              <text class="suggestion-desc">{{ suggestion.description }}</text>
              <text class="suggestion-impact">预计减排: {{ suggestion.impact }}kg CO2</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Bottom Navigation -->
    <view class="bottom-nav">
      <view class="nav-item" @click="navigateTo('/pages/index/index')">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item" @click="navigateTo('/pages/tasks/tasks')">
        <text class="nav-icon">📋</text>
        <text class="nav-text">任务</text>
      </view>
      <view class="nav-item active">
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
import { CarbonCalculator, CarbonDataManager } from '../../utils/carbonCalculator.js';
import { AuthManager } from '../../utils/auth.js';

export default {
  data() {
    return {
      carbonData: {
        today: 0,
        thisMonth: 0,
        reduction: 0,
        level: { 
          level: '计算中...', 
          icon: '📊', 
          color: '#999',
          description: '正在分析您的碳足迹数据...',
          progress: 0
        }
      },
      chartData: [],
      monthlyStats: null,
      activityData: [],
      monthlyComparison: [],
      suggestions: [],
      apiAvailable: false,
      lastLoadTime: 0 // 添加最后加载时间
    };
  },
  
  onLoad() {
    // 检查登录状态
    if (!AuthManager.requireAuth()) {
      return;
    }
    
    this.loadDataFromAPI();
  },
  
  onShow() {
    // 页面显示时刷新数据，但限制频率
    const now = Date.now();
    if (!this.lastLoadTime || now - this.lastLoadTime > 30000) { // 30秒内不重复加载
      this.lastLoadTime = now;
      this.loadDataFromAPI();
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    navigateTo(url) {
      // 使用 redirectTo 替换当前页面，避免页面栈溢出
      uni.redirectTo({ url });
    },
    
    // 跳转到碳足迹记录页面
    goToCarbonTracker() {
      uni.navigateTo({
        url: '/pages/carbon-tracker/carbon-tracker'
      });
    },
    
    // 从API加载数据
    async loadDataFromAPI() {
      // 直接使用本地数据，避免大量API错误
      this.loadLocalData();
      
      // 静默尝试API调用，不显示错误
      this.tryLoadFromAPI();
    },

    // 静默尝试API调用
    async tryLoadFromAPI() {
      try {
        // 先测试一个简单的API调用
        const testRes = await this.$api.getStatisticsOverview();
        
        if (testRes.success) {
          // 如果API可用，再进行完整的数据加载
          this.apiAvailable = true;
          await this.loadFullDataFromAPI();
        }
      } catch (error) {
        // 静默失败，不输出错误，继续使用本地数据
        this.apiAvailable = false;
        console.log('API服务暂时不可用，使用本地数据');
      }
    },

    // 完整的API数据加载
    async loadFullDataFromAPI() {
      try {
        // 并发调用多个API
        const [overviewRes, trendsRes, activitiesRes, monthlyRes, suggestionsRes] = await Promise.all([
          this.$api.getStatisticsOverview(),
          this.$api.getStatisticsTrends('week'),
          this.$api.getStatisticsActivities('week'),
          this.$api.getMonthlyComparison(3),
          this.$api.getSuggestions()
        ]);

        // 处理概览数据
        if (overviewRes.success) {
          const data = overviewRes.data;
          this.carbonData = {
            today: data.todayEmission || 0,
            thisMonth: data.monthlyEmission || 0,
            reduction: data.reductionAmount || 0,
            level: data.carbonLevel || {
              level: '初级', 
              icon: '🌱', 
              color: '#4CAF50',
              description: '您的碳排放处于合理水平',
              progress: 30
            }
          };
        }

        // 处理趋势数据
        if (trendsRes.success) {
          this.chartData = trendsRes.data.trends || [];
        }

        // 处理活动分布数据
        if (activitiesRes.success) {
          this.activityData = activitiesRes.data.activities || [];
        }

        // 处理月度对比数据
        if (monthlyRes.success) {
          this.monthlyComparison = monthlyRes.data.comparison || [];
        }

        // 处理建议数据
        if (suggestionsRes.success) {
          this.suggestions = suggestionsRes.data.suggestions || [];
        }

        console.log('API数据加载成功');
      } catch (error) {
        // 静默处理错误
        console.log('API数据加载失败，继续使用本地数据');
      }
    },

    // 加载本地数据作为备用
    loadLocalData() {
      const today = new Date().toISOString().split('T')[0];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // 获取今日数据
      const allData = CarbonDataManager.getData();
      const todayData = allData[today];
      this.carbonData.today = todayData ? todayData.emission : 0;
      
      // 获取本月统计
      this.monthlyStats = CarbonDataManager.getMonthlyStats(currentYear, currentMonth);
      this.carbonData.thisMonth = this.monthlyStats.total_emission;
      this.carbonData.reduction = this.calculateReduction();
      this.carbonData.level = CarbonCalculator.getCarbonLevel(this.carbonData.reduction);
      
      // 生成各种数据
      this.generateChartData();
      this.generateActivityData();
      this.generateMonthlyComparison();
      this.generateSuggestions();
    },
    
    // 计算减排量（假设标准值）
    calculateReduction() {
      const standardDaily = 15; // 标准日均碳排放15kg
      const actualDaily = this.monthlyStats ? this.monthlyStats.avg_daily : 0;
      return Math.max(0, (standardDaily - actualDaily) * 30); // 月度减排量
    },
    
    // 生成图表数据
    generateChartData() {
      const data = CarbonDataManager.getData();
      const last7Days = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data[dateStr];
        last7Days.push({
          date: dateStr,
          emission: dayData ? dayData.emission : 0
        });
      }
      
      this.chartData = last7Days;
    },
    
    // 生成活动分布数据
    generateActivityData() {
      const data = CarbonDataManager.getData();
      const activities = {
        transportation: { name: '交通出行', icon: '🚗', emission: 0 },
        electricity: { name: '用电', icon: '💡', emission: 0 },
        water: { name: '用水', icon: '💧', emission: 0 },
        gas: { name: '用气', icon: '🔥', emission: 0 },
        food: { name: '饮食', icon: '🍽️', emission: 0 },
        waste: { name: '废物', icon: '🗑️', emission: 0 }
      };
      
      // 统计各类活动的排放量
      Object.values(data).forEach(dayData => {
        if (dayData.activities) {
          dayData.activities.forEach(activity => {
            if (activities[activity.type]) {
              activities[activity.type].emission += activity.emission;
            }
          });
        }
      });
      
      // 计算总排放量
      const totalEmission = Object.values(activities).reduce((sum, activity) => sum + activity.emission, 0);
      
      // 计算百分比并转换为数组
      this.activityData = Object.values(activities).map(activity => ({
        ...activity,
        percentage: totalEmission > 0 ? (activity.emission / totalEmission) * 100 : 0
      })).sort((a, b) => b.emission - a.emission);
    },
    
    // 生成月度对比数据
    generateMonthlyComparison() {
      const currentDate = new Date();
      const months = [];
      
      for (let i = 2; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStats = CarbonDataManager.getMonthlyStats(date.getFullYear(), date.getMonth() + 1);
        
        months.push({
          name: `${date.getMonth() + 1}月`,
          emission: monthStats.total_emission,
          percentage: 0
        });
      }
      
      // 计算百分比（基于最大值）
      const maxEmission = Math.max(...months.map(m => m.emission));
      months.forEach(month => {
        month.percentage = maxEmission > 0 ? (month.emission / maxEmission) * 100 : 0;
      });
      
      this.monthlyComparison = months;
    },
    
    // 生成减排建议
    generateSuggestions() {
      const suggestions = [
        {
          icon: '🚶‍♂️',
          title: '增加步行',
          description: '短距离出行选择步行',
          impact: 2.5
        },
        {
          icon: '🚌',
          title: '公共交通',
          description: '使用公共交通替代私家车',
          impact: 5.0
        },
        {
          icon: '💡',
          title: '节约用电',
          description: '关闭不必要的电器设备',
          impact: 1.2
        },
        {
          icon: '🥗',
          title: '素食饮食',
          description: '增加素食比例',
          impact: 1.8
        }
      ];
      
      // 基于用户数据选择最相关的建议
      this.suggestions = suggestions.slice(0, 3);
    },
    
    // 计算图表点位置
    calculatePointPosition(emission) {
      const maxEmission = Math.max(...this.chartData.map(d => d.emission), 10); // 至少10kg作为最大值
      return 80 - (emission / maxEmission) * 60; // 反转Y轴，顶部为低排放
    },
    
    // 生成线图背景
    generateLineChart() {
      // 简单的渐变背景
      return 'linear-gradient(45deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)';
    },
    
    // 格式化日期显示
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const today = new Date();
      const diffTime = today - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays < 7) return `${diffDays}天前`;
      
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    
    // 显示日期详情
    showDayDetail(point) {
      const content = `日期：${this.formatDate(point.date)}\n碳排放：${point.emission.toFixed(1)}kg CO2\n\n点击"记录碳足迹"添加今日数据`;
      
      uni.showModal({
        title: '每日碳排放',
        content: content,
        showCancel: false
      });
    },
    
    // 显示活动详情
    showActivityDetail(activity) {
      const content = `活动类型：${activity.name}\n总排放量：${activity.emission.toFixed(1)}kg CO2\n占比：${activity.percentage.toFixed(1)}%`;
      
      uni.showModal({
        title: '活动详情',
        content: content,
        showCancel: false
      });
    }
  }
};
</script>

<style lang="scss">
.data-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-top: 100rpx; // Space for custom nav bar
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

  .custom-nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    box-sizing: border-box;
    background-color: rgba(255,255,255,0.1);
    backdrop-filter: blur(5px);
    z-index: 100;
    border-bottom: 1rpx solid rgba(255,255,255,0.2);

    .back-button {
      .icon {
        font-size: 50rpx;
        font-weight: bold;
        color: #fff;
      }
    }
    .nav-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #fff;
    }
    .action-button {
      .action-text {
        font-size: 40rpx;
        font-weight: bold;
        color: #fff;
      }
    }
  }

  .content-scroll {
    flex: 1;
    width: 100%;
  }

  .section {
    margin: 30rpx;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #fff;
      }
      .section-subtitle {
        font-size: 24rpx;
        color: #fff;
      }
    }
  }

  .overview-card {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .overview-item {
      text-align: center;

      .overview-number {
        font-size: 40rpx;
        font-weight: bold;
        color: #4CAF50;
        display: block;
        margin-bottom: 10rpx;
      }
      .overview-label {
        font-size: 24rpx;
        color: #777;
      }
    }

    .overview-divider {
      width: 1rpx;
      height: 60rpx;
      background-color: #e0e0e0;
    }
  }

  .level-card {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .level-icon {
      font-size: 40rpx;
      color: #4CAF50;
      margin-right: 20rpx;
    }

    .level-info {
      .level-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #4CAF50;
        margin-bottom: 10rpx;
      }
      .level-desc {
        font-size: 24rpx;
        color: #777;
      }
    }

    .level-progress {
      flex: 1;
      height: 20rpx;
      background-color: #e0e0e0;
      border-radius: 10rpx;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        background-color: #4CAF50;
      }

      .progress-text {
        font-size: 24rpx;
        color: #777;
        float: right;
      }
    }
  }

  .chart-card {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
  }

  .trend-chart {
    height: 200rpx;
    position: relative;

    .chart-area {
      position: relative;
      height: 160rpx;
      border-bottom: 2rpx solid #e0e0e0;
      border-left: 2rpx solid #e0e0e0;

      .chart-line {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: 
          linear-gradient(135deg, transparent 48%, #4CAF50 49%, #4CAF50 51%, transparent 52%),
          linear-gradient(45deg, transparent 48%, #4CAF50 49%, #4CAF50 51%, transparent 52%);
        background-size: 60rpx 60rpx, 60rpx 60rpx;
        background-position: 0 0, 30rpx 30rpx;
      }

      .data-point {
        position: absolute;
        width: 16rpx;
        height: 16rpx;
        background-color: #4CAF50;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        
        &.active {
          background-color: #2E7D32;
          width: 20rpx;
          height: 20rpx;
        }
      }
    }

    .chart-labels {
      display: flex;
      justify-content: space-around;
      margin-top: 10rpx;
      
      .chart-label {
        font-size: 24rpx;
        color: #777;
      }
    }
  }

  .activity-grid {
    display: flex;
    gap: 15rpx;

    .activity-card {
      flex: 1;
      background-color: #fff;
      border-radius: 12rpx;
      padding: 25rpx 20rpx;
      box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;

      .activity-icon {
        font-size: 40rpx;
        color: #4CAF50;
        margin-bottom: 10rpx;
      }
      .activity-name {
        font-size: 24rpx;
        color: #777;
        margin-bottom: 10rpx;
      }
      .activity-value {
        font-size: 24rpx;
        color: #4CAF50;
        font-weight: bold;
      }
      .activity-bar {
        width: 100%;
        height: 20rpx;
        background-color: #e0e0e0;
        border-radius: 10rpx;
        overflow: hidden;

        .activity-progress {
          height: 100%;
          background-color: #4CAF50;
        }
      }
    }
  }

  .month-comparison {
    display: flex;
    gap: 20rpx;

    .month-item {
      flex: 1;
      height: 200rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      .month-bar {
        width: 100%;
        height: 20rpx;
        background-color: #e0e0e0;
        border-radius: 10rpx;
        overflow: hidden;

        .month-progress {
          height: 100%;
          background-color: #4CAF50;
        }
      }
      .month-value {
        font-size: 24rpx;
        color: #777;
      }
      .month-label {
        font-size: 24rpx;
        color: #777;
      }
    }
  }

  .suggestions {
    display: flex;
    gap: 20rpx;

    .suggestion-card {
      flex: 1;
      background-color: #fff;
      border-radius: 12rpx;
      padding: 25rpx 20rpx;
      box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;

      .suggestion-icon {
        font-size: 40rpx;
        color: #4CAF50;
        margin-bottom: 10rpx;
      }
      .suggestion-content {
        text-align: center;

        .suggestion-title {
          font-size: 24rpx;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10rpx;
        }
        .suggestion-desc {
          font-size: 24rpx;
          color: #777;
        }
        .suggestion-impact {
          font-size: 24rpx;
          color: #777;
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
      flex: 1;

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
</style> 