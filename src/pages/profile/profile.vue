<template>
  <view class="profile-container">
    <view class="background"></view>

    <!-- Custom Navigation Bar -->
    <view class="custom-nav-bar">
      <view class="back-button" @click="goBack">
        <text class="icon">‹</text>
      </view>
      <text class="nav-title">个人中心</text>
      <view class="edit-button" @click="editProfile">
        <text class="edit-text">编辑</text>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view class="content-scroll" scroll-y="true">
      <!-- User Profile Section -->
      <view class="profile-section">
        <view class="user-info-card">
          <view class="user-avatar" @click="changeAvatar">
            <text class="avatar-text">{{ getAvatarText() }}</text>
          </view>
          <view class="user-details">
            <text class="username">{{ currentUser.username || '低碳用户' }}</text>
            <text class="user-level">{{ userStats.level }}级 {{ userStats.title }}</text>
            <view class="user-stats">
              <view class="stat-item">
                <text class="stat-number">{{ userStats.totalCarbonSaved.toFixed(1) }}</text>
                <text class="stat-label">减排量(kg)</text>
              </view>
              <view class="stat-item">
                <text class="stat-number">{{ userStats.totalReward }}</text>
                <text class="stat-label">碳积分</text>
              </view>
              <view class="stat-item">
                <text class="stat-number">{{ userStats.totalDays }}</text>
                <text class="stat-label">坚持天数</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 成就徽章 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">成就徽章</text>
          <text class="section-subtitle">{{ achievements.filter(a => a.unlocked).length }}/{{ achievements.length }}</text>
        </view>
        <view class="achievements-grid">
          <view 
            v-for="(achievement, index) in achievements" 
            :key="index"
            class="achievement-item"
            :class="{ unlocked: achievement.unlocked }"
            @click="showAchievementDetail(achievement)"
          >
            <text class="achievement-icon">{{ achievement.icon }}</text>
            <text class="achievement-name">{{ achievement.name }}</text>
          </view>
        </view>
      </view>

      <!-- 数据统计 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">我的数据</text>
          <text class="section-subtitle" @click="navigateTo('/pages/data/data')">查看详情 ></text>
        </view>
        <view class="stats-grid">
          <view class="stats-card">
            <text class="stats-icon">📊</text>
            <text class="stats-value">{{ userStats.avgDaily.toFixed(1) }}kg</text>
            <text class="stats-label">日均排放</text>
          </view>
          <view class="stats-card">
            <text class="stats-icon">🌱</text>
            <text class="stats-value">{{ userStats.treesEquivalent }}</text>
            <text class="stats-label">相当于种树</text>
          </view>
          <view class="stats-card">
            <text class="stats-icon">⚡</text>
            <text class="stats-value">{{ userStats.energySaved }}</text>
            <text class="stats-label">节约电力</text>
          </view>
          <view class="stats-card">
            <text class="stats-icon">🎯</text>
            <text class="stats-value">{{ userStats.completionRate }}%</text>
            <text class="stats-label">任务完成率</text>
          </view>
        </view>
      </view>

      <!-- Menu Section -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">功能设置</text>
        </view>
        <view class="menu-section">
          <view class="menu-item" @click="handleMenuClick('carbonTracker')">
            <view class="menu-icon">
              <text class="icon-text">📊</text>
            </view>
            <text class="menu-text">碳足迹记录</text>
            <view class="menu-arrow">
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="menu-item" @click="handleMenuClick('settings')">
            <view class="menu-icon">
              <text class="icon-text">⚙️</text>
            </view>
            <text class="menu-text">账号设置</text>
            <view class="menu-arrow">
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="menu-item" @click="handleMenuClick('notifications')">
            <view class="menu-icon">
              <text class="icon-text">🔔</text>
            </view>
            <text class="menu-text">消息通知</text>
            <view class="menu-switch">
              <switch :checked="settings.notifications" @change="toggleNotifications" />
            </view>
          </view>

          <view class="menu-item" @click="handleMenuClick('privacy')">
            <view class="menu-icon">
              <text class="icon-text">🔒</text>
            </view>
            <text class="menu-text">隐私设置</text>
            <view class="menu-arrow">
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="menu-item" @click="handleMenuClick('help')">
            <view class="menu-icon">
              <text class="icon-text">❓</text>
            </view>
            <text class="menu-text">帮助与反馈</text>
            <view class="menu-arrow">
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="menu-item" @click="handleMenuClick('about')">
            <view class="menu-icon">
              <text class="icon-text">ℹ️</text>
            </view>
            <text class="menu-text">关于我们</text>
            <view class="menu-arrow">
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="menu-item logout" @click="handleLogout">
            <view class="menu-icon">
              <text class="icon-text">📤</text>
            </view>
            <text class="menu-text">退出登录</text>
            <view class="menu-arrow">
              <text class="arrow">›</text>
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
      <view class="nav-item" @click="navigateTo('/pages/data/data')">
        <text class="nav-icon">📊</text>
        <text class="nav-text">数据</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">🧑</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { AuthManager } from '../../utils/auth.js';
import { CarbonDataManager } from '../../utils/carbonCalculator.js';

export default {
  data() {
    return {
      currentUser: {},
      userStats: {
        level: 1,
        title: '低碳新手',
        totalCarbonSaved: 0,
        totalReward: 0,
        totalDays: 0,
        avgDaily: 0,
        treesEquivalent: 0,
        energySaved: '0 kWh',
        completionRate: 0
      },
      achievements: [
        {
          id: 1,
          name: '初来乍到',
          icon: '🌱',
          description: '完成第一个低碳任务',
          unlocked: true,
          unlockDate: '2024-01-01'
        },
        {
          id: 2,
          name: '坚持一周',
          icon: '📅',
          description: '连续记录7天碳足迹',
          unlocked: false,
          requirement: 7
        },
        {
          id: 3,
          name: '绿色出行',
          icon: '🚌',
          description: '使用公共交通10次',
          unlocked: false,
          requirement: 10
        },
        {
          id: 4,
          name: '节能达人',
          icon: '💡',
          description: '累计节约100度电',
          unlocked: false,
          requirement: 100
        },
        {
          id: 5,
          name: '素食主义',
          icon: '🥗',
          description: '选择素食20次',
          unlocked: false,
          requirement: 20
        },
        {
          id: 6,
          name: '环保先锋',
          icon: '🏆',
          description: '减少碳排放100kg',
          unlocked: false,
          requirement: 100
        }
      ],
      settings: {
        notifications: true,
        darkMode: false,
        dataSync: true
      },
      lastLoadTime: 0 // 添加最后加载时间
    };
  },
  
  onLoad() {
    // 检查登录状态
    if (!AuthManager.requireAuth()) {
      return;
    }
    
    this.loadProfileData();
  },
  
  onShow() {
    // 页面显示时刷新数据，但限制频率
    const now = Date.now();
    if (!this.lastLoadTime || now - this.lastLoadTime > 30000) { // 30秒内不重复加载
      this.lastLoadTime = now;
      this.loadProfileData();
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    navigateTo(url) {
      // 对于底部导航，使用 redirectTo 替换当前页面，避免页面栈溢出
      // 对于其他导航，使用 navigateTo
      if (url.includes('/pages/index/index') || url.includes('/pages/tasks/tasks') || url.includes('/pages/data/data')) {
        uni.redirectTo({ url });
      } else {
        uni.navigateTo({ url });
      }
    },
    
    // 从API加载个人资料数据
    async loadProfileData() {
      try {
        // 并发调用多个API
        const [profileRes, statsRes, achievementsRes, settingsRes] = await Promise.all([
          this.$api.getUserProfile(),
          this.$api.getUserStats(),
          this.$api.getAchievements(),
          this.$api.getUserSettings()
        ]);

        // 处理用户资料
        if (profileRes.success) {
          this.currentUser = {
            ...AuthManager.getCurrentUser(),
            ...profileRes.data
          };
        }

        // 处理用户统计
        if (statsRes.success) {
          this.userStats = {
            ...this.userStats,
            ...statsRes.data
          };
        }

        // 处理成就数据
        if (achievementsRes.success) {
          this.achievements = achievementsRes.data.achievements || this.achievements;
        }

        // 处理设置数据
        if (settingsRes.success) {
          this.settings = {
            ...this.settings,
            ...settingsRes.data
          };
        }

      } catch (error) {
        console.error('加载个人资料失败:', error);
        
        // 使用本地数据作为备用
        this.loadLocalUserData();
      }
    },
    
    // 加载本地用户数据作为备用
    loadLocalUserData() {
      // 获取当前用户信息
      this.currentUser = AuthManager.getCurrentUser() || {};
      
      // 加载用户统计
      this.loadUserStats();
      
      // 加载成就数据
      this.loadAchievements();
      
      // 加载设置
      this.loadSettings();
    },
    
    // 加载用户统计
    loadUserStats() {
      try {
        const stats = uni.getStorageSync('userStats') || {};
        
        // 计算其他统计数据
        const carbonData = CarbonDataManager.getData();
        const totalDays = Object.keys(carbonData).length;
        const totalEmission = Object.values(carbonData).reduce((sum, day) => sum + (day.emission || 0), 0);
        const avgDaily = totalDays > 0 ? totalEmission / totalDays : 0;
        
        // 计算相当于种树数量（假设一棵树年吸收22kg CO2）
        const treesEquivalent = Math.floor((stats.totalCarbonSaved || 0) / 22);
        
        // 计算节约电力（假设每kg CO2相当于2度电）
        const energySaved = ((stats.totalCarbonSaved || 0) * 2).toFixed(1) + ' kWh';
        
        // 计算任务完成率
        const completedTasks = stats.completedTasks || 0;
        const totalTasks = completedTasks + 5; // 假设总任务数
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // 获取等级标题
        const level = stats.level || 1;
        const title = this.getLevelTitle(level);
        
        this.userStats = {
          level,
          title,
          totalCarbonSaved: stats.totalCarbonSaved || 0,
          totalReward: stats.totalReward || 0,
          totalDays,
          avgDaily,
          treesEquivalent,
          energySaved,
          completionRate
        };
      } catch (e) {
        console.error('加载用户统计失败:', e);
      }
    },
    
    // 获取等级标题
    getLevelTitle(level) {
      const titles = {
        1: '低碳新手',
        2: '环保学徒',
        3: '绿色生活者',
        4: '低碳达人',
        5: '环保专家',
        6: '碳中和先锋'
      };
      return titles[level] || '低碳新手';
    },
    
    // 加载成就数据
    loadAchievements() {
      try {
        const savedAchievements = uni.getStorageSync('userAchievements') || [];
        
        // 更新成就状态
        this.achievements.forEach(achievement => {
          const saved = savedAchievements.find(a => a.id === achievement.id);
          if (saved) {
            achievement.unlocked = saved.unlocked;
            achievement.unlockDate = saved.unlockDate;
          }
        });
        
        // 检查新成就
        this.checkNewAchievements();
      } catch (e) {
        console.error('加载成就数据失败:', e);
      }
    },
    
    // 检查新成就
    checkNewAchievements() {
      const stats = this.userStats;
      let hasNewAchievement = false;
      
      this.achievements.forEach(achievement => {
        if (!achievement.unlocked) {
          let shouldUnlock = false;
          
          switch (achievement.id) {
            case 2: // 坚持一周
              shouldUnlock = stats.totalDays >= 7;
              break;
            case 6: // 环保先锋
              shouldUnlock = stats.totalCarbonSaved >= 100;
              break;
            // 可以添加更多成就检查逻辑
          }
          
          if (shouldUnlock) {
            achievement.unlocked = true;
            achievement.unlockDate = new Date().toISOString().split('T')[0];
            hasNewAchievement = true;
          }
        }
      });
      
      if (hasNewAchievement) {
        this.saveAchievements();
        // 显示新成就提示
        setTimeout(() => {
          uni.showToast({
            title: '获得新成就！',
            icon: 'success'
          });
        }, 500);
      }
    },
    
    // 保存成就数据
    saveAchievements() {
      try {
        const achievementData = this.achievements.map(a => ({
          id: a.id,
          unlocked: a.unlocked,
          unlockDate: a.unlockDate
        }));
        uni.setStorageSync('userAchievements', achievementData);
      } catch (e) {
        console.error('保存成就数据失败:', e);
      }
    },
    
    // 加载设置
    loadSettings() {
      try {
        const settings = uni.getStorageSync('userSettings') || {};
        this.settings = { ...this.settings, ...settings };
      } catch (e) {
        console.error('加载设置失败:', e);
      }
    },
    
    // 保存设置
    saveSettings() {
      try {
        uni.setStorageSync('userSettings', this.settings);
      } catch (e) {
        console.error('保存设置失败:', e);
      }
    },
    
    // 获取头像文字
    getAvatarText() {
      const username = this.currentUser.username || '用户';
      return username.substring(0, 1).toUpperCase();
    },
    
    // 编辑资料
    editProfile() {
      uni.showModal({
        title: '编辑资料',
        content: '编辑个人资料功能开发中',
        showCancel: false
      });
    },
    
    // 更换头像
    changeAvatar() {
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 拍照
            uni.chooseImage({
              count: 1,
              sourceType: ['camera'],
              success: (res) => {
                console.log('选择照片:', res.tempFilePaths);
                uni.showToast({
                  title: '头像更新功能开发中',
                  icon: 'none'
                });
              }
            });
          } else if (res.tapIndex === 1) {
            // 从相册选择
            uni.chooseImage({
              count: 1,
              sourceType: ['album'],
              success: (res) => {
                console.log('选择照片:', res.tempFilePaths);
                uni.showToast({
                  title: '头像更新功能开发中',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },
    
    // 显示成就详情
    showAchievementDetail(achievement) {
      const status = achievement.unlocked ? '已解锁' : '未解锁';
      const unlockInfo = achievement.unlocked 
        ? `解锁时间：${achievement.unlockDate}` 
        : `解锁条件：${achievement.description}`;
      
      const content = `${achievement.description}\n\n状态：${status}\n${unlockInfo}`;
      
      uni.showModal({
        title: achievement.name,
        content: content,
        showCancel: false
      });
    },
    
    // 切换通知设置
    toggleNotifications(e) {
      this.settings.notifications = e.detail.value;
      this.saveSettings();
      
      uni.showToast({
        title: e.detail.value ? '已开启通知' : '已关闭通知',
        icon: 'success'
      });
    },
    
    // 处理菜单点击
    handleMenuClick(type) {
      console.log('Menu clicked:', type);
      
      switch (type) {
        case 'carbonTracker':
          uni.navigateTo({
            url: '/pages/carbon-tracker/carbon-tracker'
          });
          break;
        case 'settings':
          uni.showModal({
            title: '账号设置',
            content: '账号设置功能开发中\n\n可以设置：\n- 修改密码\n- 绑定手机\n- 数据同步',
            showCancel: false
          });
          break;
        case 'privacy':
          uni.showModal({
            title: '隐私设置',
            content: '隐私设置功能开发中\n\n包含：\n- 数据隐私\n- 位置权限\n- 使用统计',
            showCancel: false
          });
          break;
        case 'help':
          uni.showModal({
            title: '帮助与反馈',
            content: '如有问题请联系：\n\n邮箱：support@lowcarbon.com\n电话：400-123-4567\n\n感谢您的使用！',
            showCancel: false
          });
          break;
        case 'about':
          uni.showModal({
            title: '关于我们',
            content: '低碳生活管理应用 v1.0\n\n致力于帮助用户建立低碳生活方式，\n共同守护地球家园。\n\n© 2024 低碳科技有限公司',
            showCancel: false
          });
          break;
        default:
          uni.showToast({
            title: `${type} 功能开发中`,
            icon: 'none'
          });
      }
    },
    
    // 退出登录
    async handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用后端登出API
              await this.$api.logout();
            } catch (error) {
              console.error('后端登出失败:', error);
              // 即使后端失败也继续本地登出
            }
            
            // 使用认证管理器登出
            AuthManager.logout();
            
            uni.showToast({
              title: '退出成功',
              icon: 'success'
            });
            
            // 跳转到登录页面
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }, 1500);
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
.profile-container {
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
    .edit-button {
      .edit-text {
        font-size: 28rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }

  .content-scroll {
    flex: 1;
    width: 100%;
  }

  .profile-section {
    margin: 30rpx;

    .user-info-card {
      background-color: #fff;
      border-radius: 15rpx;
      padding: 40rpx 30rpx;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;

      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        border: 3rpx solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 30rpx;

        .avatar-text {
          font-size: 60rpx;
          color: #999;
          font-weight: bold;
        }
      }

      .user-details {
        flex: 1;

        .username {
          font-size: 40rpx;
          font-weight: bold;
          color: #333;
          display: block;
          margin-bottom: 10rpx;
        }

        .user-level {
          font-size: 28rpx;
          color: #666;
          display: block;
          margin-bottom: 15rpx;
        }

        .user-stats {
          display: flex;
          flex-direction: column;
          gap: 5rpx;

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5rpx;

            .stat-number {
              font-size: 24rpx;
              color: #333;
              font-weight: bold;
            }

            .stat-label {
              font-size: 24rpx;
              color: #888;
            }
          }
        }
      }
    }
  }

  .section {
    margin: 30rpx;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15rpx;

      .section-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .section-subtitle {
        font-size: 28rpx;
        color: #666;
        font-weight: 400;
      }
    }
  }

  .achievements-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;

    .achievement-item {
      width: calc(33.33% - 10rpx);
      padding: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &:active {
        background-color: #f8f8f8;
        transform: scale(0.98);
      }

      &.unlocked {
        .achievement-icon {
          color: #4CAF50;
        }
        .achievement-name {
          color: #333;
        }
      }

      .achievement-icon {
        font-size: 40rpx;
        margin-bottom: 10rpx;
      }

      .achievement-name {
        font-size: 28rpx;
        color: #888;
        font-weight: 400;
      }
    }
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;

    .stats-card {
      width: calc(50% - 5rpx);
      padding: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .stats-icon {
        font-size: 40rpx;
        margin-bottom: 10rpx;
      }

      .stats-value {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
      }

      .stats-label {
        font-size: 24rpx;
        color: #888;
      }
    }
  }

  .menu-section {
    margin: 0 30rpx 30rpx;

    .menu-item {
      background-color: #fff;
      border-radius: 12rpx;
      margin-bottom: 15rpx;
      padding: 25rpx 30rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      transition: all 0.3s;

      &:active {
        background-color: #f8f8f8;
        transform: scale(0.98);
      }

      &.logout {
        .menu-text {
          color: #f44336;
        }
        .icon-text {
          color: #f44336;
        }
      }

      .menu-icon {
        width: 50rpx;
        height: 50rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;

        .icon-text {
          font-size: 32rpx;
        }
      }

      .menu-text {
        flex: 1;
        font-size: 30rpx;
        color: #333;
        font-weight: 400;
      }

      .menu-arrow {
        .arrow {
          font-size: 40rpx;
          color: #ccc;
          font-weight: bold;
        }
      }

      &:last-child {
        margin-bottom: 0;
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