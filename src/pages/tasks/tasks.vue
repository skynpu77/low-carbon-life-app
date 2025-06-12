<template>
  <view class="tasks-container">
    <view class="background"></view>

    <!-- Custom Navigation Bar -->
    <view class="custom-nav-bar">
      <view class="back-button" @click="goBack">
        <text class="icon">‹</text>
      </view>
      <text class="nav-title">任务中心</text>
      <view class="placeholder"></view>
    </view>

    <!-- 用户统计卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-number">{{ userStats.totalReward }}</text>
        <text class="stats-label">碳积分</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-number">{{ userStats.totalCarbonSaved.toFixed(1) }}</text>
        <text class="stats-label">减排量(kg)</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-number">Lv.{{ userStats.level }}</text>
        <text class="stats-label">等级</text>
      </view>
    </view>

    <!-- Task List -->
    <scroll-view class="task-list-scroll" scroll-y="true">
      <view class="task-card" v-for="(task, index) in tasks" :key="task.id">
        <view class="task-header" @click="viewTaskDetails(task)">
          <view class="task-icon">{{ task.icon }}</view>
          <view class="task-info">
            <text class="task-name">{{ task.name }}</text>
            <text class="task-description">{{ task.description }}</text>
          </view>
          <view class="task-actions">
            <text 
              v-if="task.isCustom" 
              class="delete-btn" 
              @click.stop="deleteCustomTask(task.taskId)"
            >
              🗑️
            </text>
            <text :class="['task-status-icon', task.status]">{{ getStatusIcon(task.status) }}</text>
          </view>
        </view>
        <view class="task-body">
          <view class="task-rewards">
            <view class="reward-item">
              <text class="reward-icon">🌱</text>
              <text class="reward-text">-{{ task.carbonSaved }}kg CO2</text>
            </view>
            <view class="reward-item">
              <text class="reward-icon">⭐</text>
              <text class="reward-text">+{{ task.reward }} 积分</text>
            </view>
          </view>
          <view class="progress-section" v-if="task.progress !== undefined">
            <view class="progress-bar-container">
              <view class="progress-bar" :style="{ width: task.progress + '%' }">
                <view class="progress-stripes" v-if="task.progress > 0 && task.progress < 100"></view>
              </view>
            </view>
            <text class="progress-text">{{ task.progress }}%</text>
          </view>
          <button 
            :class="['task-action-button', task.status]" 
            @click="handleTaskAction(task)"
            :disabled="task.status === 'completed'"
          >
            {{ getActionText(task) }}
          </button>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在加载任务...</text>
      </view>

      <!-- 空状态提示 -->
      <view class="empty-state" v-else-if="tasks.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无任务</text>
        <text class="empty-desc">请稍后再试或联系管理员</text>
        <button class="reload-btn" @click="reloadData">重新加载</button>
      </view>
    </scroll-view>

    <!-- 添加任务按钮 -->
    <view class="floating-button add-task" @click="showAddTaskModal">
      <text class="fab-icon">➕</text>
      <text class="fab-text">添加任务</text>
    </view>

    <!-- 碳足迹记录入口 -->
    <view class="floating-button carbon-tracker" @click="goToCarbonTracker">
      <text class="fab-icon">📊</text>
      <text class="fab-text">记录碳足迹</text>
    </view>

    <!-- Bottom Navigation -->
    <view class="bottom-nav">
      <view class="nav-item" @click="navigateTo('/pages/index/index')">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item active">
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

    <!-- 添加任务弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="hideAddTaskModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加自定义任务</text>
          <text class="modal-close" @click="hideAddTaskModal">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">任务名称</text>
            <textarea 
              class="form-input" 
              v-model="newTask.name"
              placeholder="请输入任务名称"
              maxlength="20"
              style="height: 80rpx; resize: none;"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">任务描述</text>
            <textarea 
              class="form-textarea" 
              v-model="newTask.description"
              placeholder="请输入任务描述"
              maxlength="100"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">任务图标</text>
            <scroll-view class="icon-selector" scroll-x="true">
              <view 
                v-for="icon in taskIcons" 
                :key="icon"
                class="icon-option"
                :class="{ active: newTask.icon === icon }"
                @click="selectIcon(icon)"
              >
                <text class="icon-text">{{ icon }}</text>
              </view>
            </scroll-view>
          </view>
          
          <view class="form-row">
            <view class="form-group half">
              <text class="form-label">奖励积分</text>
              <textarea 
                class="form-input" 
                v-model="newTask.reward"
                placeholder="10"
                style="height: 80rpx; resize: none;"
              />
            </view>
            <view class="form-group half">
              <text class="form-label">减排量(kg)</text>
              <textarea 
                class="form-input" 
                v-model="newTask.carbonSaved"
                placeholder="1.0"
                style="height: 80rpx; resize: none;"
              />
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="hideAddTaskModal">取消</button>
          <button class="btn-confirm" @click="addCustomTask">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { AuthManager } from '../../utils/auth.js';

export default {
  data() {
    return {
      tasks: [],
      userStats: {
        totalReward: 0,
        totalCarbonSaved: 0,
        level: 1
      },
      highlightTaskId: null,
      loading: false,
      showModal: false,
      newTask: {
        name: '',
        description: '',
        icon: '🌱',
        reward: 10,
        carbonSaved: 1.0
      },
      taskIcons: ['🌱', '♻️', '🚲', '💡', '💧', '🌳', '🥬', '🚌', '☀️', '📱', '🏠', '🌿', '🔋', '🛒'],
      lastLoadTime: 0 // 添加最后加载时间
    };
  },
  
  onLoad(options) {
    // 检查登录状态
    if (!AuthManager.requireAuth()) {
      return;
    }
    
    // 检查是否有特定任务ID（从首页跳转）
    if (options && options.taskId) {
      this.highlightTaskId = parseInt(options.taskId);
    }
    
    // 先加载本地数据，确保有基础显示
    this.loadLocalTasks();
    
    // 然后尝试从API加载
    this.loadTasksData();
  },
  
  onShow() {
    // 页面显示时刷新任务状态，但限制频率
    const now = Date.now();
    if (!this.lastLoadTime || now - this.lastLoadTime > 30000) { // 30秒内不重复加载
      this.lastLoadTime = now;
      this.loadTasksData();
    }
  },
  
  methods: {
    async loadTasksData() {
      if (this.loading) return;
      this.loading = true;
      
      try {
        // 调用API获取任务数据
        const response = await this.$api.getTasks();
        
        // 检查API响应是否成功
        if (response.success) {
          console.log('API响应成功，完整数据结构:', JSON.stringify(response, null, 2));
          
          // 处理不同的数据格式
          let tasks = [];
          let userStats = {};
          
          if (response.data) {
            console.log('response.data类型:', typeof response.data);
            console.log('response.data内容:', response.data);
            
            // 情况1: 数据在 response.data.tasks 中
            if (response.data.tasks && Array.isArray(response.data.tasks)) {
              tasks = response.data.tasks;
              userStats = response.data.userStats || {};
              console.log('使用格式1: response.data.tasks，任务数量:', tasks.length);
            }
            // 情况2: 数据直接是任务数组
            else if (Array.isArray(response.data)) {
              tasks = response.data;
              console.log('使用格式2: response.data直接是数组，任务数量:', tasks.length);
            }
            // 情况3: 数据在其他字段中
            else if (response.data.data && Array.isArray(response.data.data)) {
              tasks = response.data.data;
              console.log('使用格式3: response.data.data，任务数量:', tasks.length);
            }
            // 情况4: 检查其他可能的字段
            else {
              console.log('未识别的数据格式，检查所有字段:');
              Object.keys(response.data).forEach(key => {
                console.log(`- ${key}:`, typeof response.data[key], Array.isArray(response.data[key]) ? `数组长度${response.data[key].length}` : '');
              });
            }
          } else {
            console.log('response.data为空或undefined');
          }
          
          // 如果获取到任务数据，更新界面
          if (tasks.length > 0) {
            // 加载自定义任务并合并
            const customTasks = this.getCustomTasks();
            this.tasks = [...customTasks, ...tasks];
            this.userStats = { ...this.userStats, ...userStats };
            
            console.log('API任务数据加载成功:', tasks.length, '个任务');
            
            // 如果有高亮任务ID，滚动到对应位置
            if (this.highlightTaskId) {
              this.$nextTick(() => {
                this.scrollToTask(this.highlightTaskId);
              });
            }
          } else {
            console.log('API返回空任务列表，使用预制数据');
            // 使用预制的任务数据
            this.loadPresetTasks();
          }
        } else {
          console.log('API响应失败，使用本地数据');
        }
      } catch (error) {
        console.log('API调用失败，使用预制数据:', error.message);
        
        // 使用预制数据替代本地数据
        this.loadPresetTasks();
      } finally {
        this.loading = false;
      }
    },
    
    loadLocalTasks() {
      // 本地模拟数据作为备用
      const systemTasks = this.getSystemTasks();

      // 加载自定义任务并合并
      const customTasks = this.getCustomTasks();
      this.tasks = [...customTasks, ...systemTasks];
      
      this.userStats = {
        totalReward: 1250,
        totalCarbonSaved: 45.6,
        level: 3
      };
    },

    // 预制任务数据（更丰富的内容）
    loadPresetTasks() {
      const presetTasks = [
        // 今日任务
        {
          taskId: 101,
          name: '步行上班',
          description: '选择步行或骑行上班，减少交通碳排放',
          status: 'active',
          progress: 60,
          carbonSaved: 3.2,
          reward: 32,
          category: 'transport',
          icon: '🚶‍♂️',
          type: 'daily'
        },
        {
          taskId: 102,
          name: '素食午餐',
          description: '选择素食午餐，减少畜牧业碳足迹',
          status: 'pending',
          progress: 0,
          carbonSaved: 2.1,
          reward: 21,
          category: 'food',
          icon: '🥗',
          type: 'daily'
        },
        {
          taskId: 103,
          name: '节约用水',
          description: '洗手、刷牙时及时关闭水龙头',
          status: 'pending',
          progress: 0,
          carbonSaved: 1.5,
          reward: 15,
          category: 'water',
          icon: '💧',
          type: 'daily'
        },
        {
          taskId: 104,
          name: '垃圾分类',
          description: '正确进行垃圾分类，促进资源回收',
          status: 'completed',
          progress: 100,
          carbonSaved: 1.8,
          reward: 18,
          category: 'waste',
          icon: '♻️',
          type: 'daily'
        },
        {
          taskId: 105,
          name: '关闭待机电器',
          description: '离开时关闭电脑、电视等待机设备',
          status: 'pending',
          progress: 0,
          carbonSaved: 2.8,
          reward: 28,
          category: 'energy',
          icon: '💡',
          type: 'daily'
        },
        // 本周任务
        {
          taskId: 201,
          name: '公共交通周',
          description: '本周至少5天使用公共交通出行',
          status: 'active',
          progress: 40,
          carbonSaved: 15.6,
          reward: 156,
          category: 'transport',
          icon: '🚌',
          type: 'weekly'
        },
        {
          taskId: 202,
          name: '无肉星期一',
          description: '每周一选择素食，坚持一个月',
          status: 'pending',
          progress: 0,
          carbonSaved: 8.4,
          reward: 84,
          category: 'food',
          icon: '🌱',
          type: 'weekly'
        },
        {
          taskId: 203,
          name: '绿色出行挑战',
          description: '本周累计步行或骑行50公里',
          status: 'active',
          progress: 25,
          carbonSaved: 12.3,
          reward: 123,
          category: 'transport',
          icon: '🚲',
          type: 'weekly'
        },
        // 月度任务
        {
          taskId: 301,
          name: '零废料挑战',
          description: '本月减少50%的生活垃圾产生',
          status: 'pending',
          progress: 0,
          carbonSaved: 25.8,
          reward: 258,
          category: 'waste',
          icon: '🗂️',
          type: 'monthly'
        },
        {
          taskId: 302,
          name: '节能达人',
          description: '本月电费比上月减少20%',
          status: 'active',
          progress: 15,
          carbonSaved: 18.9,
          reward: 189,
          category: 'energy',
          icon: '⚡',
          type: 'monthly'
        }
      ];

      // 加载自定义任务并合并
      const customTasks = this.getCustomTasks();
      this.tasks = [...customTasks, ...presetTasks];
      
      this.userStats = {
        totalReward: 1580,
        totalCarbonSaved: 67.3,
        level: 4
      };

      console.log('加载预制任务数据:', presetTasks.length, '个任务');
    },

    // 获取系统默认任务
    getSystemTasks() {
      return [
        {
          taskId: 1,
          name: '步行10000步',
          description: '今日步行至少10000步，减少碳排放',
          status: 'active',
          progress: 75,
          carbonSaved: 2.5,
          reward: 25,
          category: 'transport',
          icon: '🚶‍♂️',
          type: 'daily'
        },
        {
          taskId: 2,
          name: '素食一餐',
          description: '选择一餐素食，减少畜牧业碳排放',
          status: 'pending',
          progress: 0,
          carbonSaved: 1.8,
          reward: 18,
          category: 'food',
          icon: '🥗',
          type: 'daily'
        },
        {
          taskId: 3,
          name: '公共交通出行',
          description: '使用公共交通工具出行，减少私家车使用',
          status: 'pending',
          progress: 0,
          carbonSaved: 5.2,
          reward: 52,
          category: 'transport',
          icon: '🚌',
          type: 'daily'
        }
      ];
    },
    
    scrollToTask(taskId) {
      // 滚动到指定任务
      const taskIndex = this.tasks.findIndex(task => task.taskId === taskId);
      if (taskIndex !== -1) {
        // 简单的滚动提示
        uni.showToast({
          title: `定位到任务: ${this.tasks[taskIndex].name}`,
          icon: 'none',
          duration: 1500
        });
      }
    },

    // 重新加载数据
    reloadData() {
      this.tasks = [];
      this.loadLocalTasks();
      this.loadTasksData();
    },
    
    goBack() {
      uni.navigateBack();
    },
    
    navigateTo(url) {
      // 使用 redirectTo 替换当前页面，避免页面栈溢出
      uni.redirectTo({ url });
    },
    
    goToCarbonTracker() {
      uni.navigateTo({
        url: '/pages/carbon-tracker/carbon-tracker'
      });
    },

    // 自定义任务相关方法
    showAddTaskModal() {
      this.showModal = true;
      // 确保数据被正确初始化
      this.resetNewTask();
      console.log('打开添加任务弹窗，当前数据：', this.newTask);
    },

    hideAddTaskModal() {
      this.showModal = false;
      this.resetNewTask();
    },

    resetNewTask() {
      this.newTask = {
        name: '',
        description: '',
        icon: '🌱',
        reward: 10,
        carbonSaved: 1.0
      };
    },

    selectIcon(icon) {
      this.newTask.icon = icon;
    },

    addCustomTask() {
      // 验证输入
      if (!this.newTask.name.trim()) {
        uni.showToast({
          title: '请输入任务名称',
          icon: 'none'
        });
        return;
      }

      if (!this.newTask.description.trim()) {
        uni.showToast({
          title: '请输入任务描述',
          icon: 'none'
        });
        return;
      }

      // 生成新的任务ID
      const customTasks = this.getCustomTasks();
      const maxId = Math.max(
        ...this.tasks.map(t => t.taskId || 0),
        ...customTasks.map(t => t.taskId || 0),
        1000
      );

      // 创建新任务对象
      const newTask = {
        taskId: maxId + 1,
        name: this.newTask.name.trim(),
        description: this.newTask.description.trim(),
        icon: this.newTask.icon,
        reward: this.newTask.reward || 10,
        carbonSaved: this.newTask.carbonSaved || 1.0,
        status: 'pending',
        progress: 0,
        category: 'custom',
        type: 'custom',
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      // 保存到本地存储
      customTasks.push(newTask);
      this.saveCustomTasks(customTasks);

      // 添加到当前任务列表
      this.tasks.unshift(newTask);

      // 隐藏弹窗
      this.hideAddTaskModal();

      // 显示成功提示
      uni.showToast({
        title: '任务创建成功！',
        icon: 'success'
      });
    },

    deleteCustomTask(taskId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个自定义任务吗？',
        success: (res) => {
          if (res.confirm) {
            // 从当前列表中移除
            this.tasks = this.tasks.filter(task => task.taskId !== taskId);
            
            // 从本地存储中移除
            const customTasks = this.getCustomTasks();
            const updatedTasks = customTasks.filter(task => task.taskId !== taskId);
            this.saveCustomTasks(updatedTasks);

            uni.showToast({
              title: '任务已删除',
              icon: 'success'
            });
          }
        }
      });
    },

    getCustomTasks() {
      try {
        const tasks = uni.getStorageSync('customTasks');
        return Array.isArray(tasks) ? tasks : [];
      } catch (error) {
        console.error('获取自定义任务失败:', error);
        return [];
      }
    },

    saveCustomTasks(tasks) {
      try {
        uni.setStorageSync('customTasks', tasks);
      } catch (error) {
        console.error('保存自定义任务失败:', error);
      }
    },

    updateCustomTaskStatus(task) {
      try {
        const customTasks = this.getCustomTasks();
        const taskIndex = customTasks.findIndex(t => t.taskId === task.taskId);
        if (taskIndex !== -1) {
          customTasks[taskIndex] = { ...customTasks[taskIndex], ...task };
          this.saveCustomTasks(customTasks);
        }
      } catch (error) {
        console.error('更新自定义任务状态失败:', error);
      }
    },

    loadCustomTasks() {
      const customTasks = this.getCustomTasks();
      // 将自定义任务添加到任务列表前面
      if (customTasks.length > 0) {
        this.tasks = [...customTasks, ...this.tasks];
      }
    },
    
    // 处理任务操作
    handleTaskAction(task) {
      switch (task.status) {
        case 'pending':
        case 'active':
          this.completeTask(task);
          break;
        case 'completed':
          this.viewTaskDetails(task);
          break;
        case 'failed':
          this.resetTask(task);
          break;
        default:
          break;
      }
    },
    
    // 完成任务
    async completeTask(task) {
      if (task.status === 'completed') {
        uni.showToast({
          title: '任务已完成',
          icon: 'none'
        });
        return;
      }
      
      // 显示任务完成确认
      uni.showModal({
        title: '完成任务',
        content: `确认完成"${task.name}"吗？\n将获得 ${task.reward} 碳积分`,
        success: (res) => {
          if (res.confirm) {
            this.markTaskCompleted(task);
          }
        }
      });
    },
    
    // 标记任务完成
    async markTaskCompleted(task) {
      try {
        // 先尝试API完成任务
        const response = await this.$api.completeTask(task.taskId);
        
        if (response.success) {
          // 更新本地任务状态
          task.status = 'completed';
          task.progress = 100;
          
          // 更新用户统计
          const data = response.data;
          if (data.newTotalReward) {
            this.userStats.totalReward = data.newTotalReward;
          }
          if (data.carbonSaved) {
            this.userStats.totalCarbonSaved += data.carbonSaved;
          }
          
          // 显示奖励
          uni.showToast({
            title: `+${data.rewardEarned || task.reward} 碳积分`,
            icon: 'success'
          });
          
          // 检查升级
          if (data.levelUp) {
            setTimeout(() => {
              uni.showModal({
                title: '恭喜升级！',
                content: `您已升级到 ${data.newLevel} 级低碳达人！`,
                showCancel: false
              });
            }, 1000);
            this.userStats.level = data.newLevel;
          }
          
          // 安全的震动反馈
          this.safeVibrate();
        } else {
          throw new Error(response.message || '完成任务失败');
        }
      } catch (error) {
        console.log('API完成任务失败，使用本地逻辑:', error.message);
        
        // 使用本地完成逻辑作为备用
        this.markTaskCompletedLocal(task);
      }
    },
    
    // 本地任务完成逻辑
    markTaskCompletedLocal(task) {
      try {
        task.status = 'completed';
        task.progress = 100;
        
        // 更新用户统计
        this.userStats.totalCarbonSaved += task.carbonSaved;
        this.userStats.totalReward += task.reward;
        
        // 检查升级
        const currentLevel = Math.floor(this.userStats.totalReward / 100) + 1;
        if (currentLevel > this.userStats.level) {
          this.userStats.level = currentLevel;
          
          setTimeout(() => {
            uni.showModal({
              title: '恭喜升级！',
              content: `您已升级到 ${currentLevel} 级低碳达人！`,
              showCancel: false
            });
          }, 1000);
        }
        
        // 保存到本地存储
        this.saveLocalData();
        
        // 如果是自定义任务，也要更新自定义任务存储
        if (task.isCustom) {
          this.updateCustomTaskStatus(task);
        }
        
        // 显示奖励
        uni.showToast({
          title: `+${task.reward} 碳积分`,
          icon: 'success'
        });
        
        // 安全的震动反馈
        this.safeVibrate();
      } catch (error) {
        console.error('本地任务完成失败:', error);
        uni.showToast({
          title: '任务完成失败',
          icon: 'none'
        });
      }
    },

    // 安全的震动反馈
    safeVibrate() {
      try {
        if (uni.vibrateShort && typeof uni.vibrateShort === 'function') {
          uni.vibrateShort({
            success: () => {},
            fail: () => {}
          });
        }
      } catch (error) {
        // 静默忽略震动错误
      }
    },
    
    saveLocalData() {
      try {
        uni.setStorageSync('userStats', this.userStats);
        const taskProgress = this.tasks.map(task => ({
          taskId: task.taskId,
          status: task.status,
          progress: task.progress
        }));
        uni.setStorageSync('taskProgress', taskProgress);
      } catch (e) {
        console.error('保存本地数据失败:', e);
      }
    },
    
    // 重置任务
    resetTask(task) {
      if (task.status === 'failed') {
        uni.showModal({
          title: '重新挑战',
          content: `重新开始"${task.name}"任务？`,
          success: (res) => {
            if (res.confirm) {
              task.status = 'pending';
              task.progress = 0;
              this.saveTaskProgress();
              
              uni.showToast({
                title: '任务已重置',
                icon: 'success'
              });
            }
          }
        });
      }
    },
    
    // 查看任务详情
    viewTaskDetails(task) {
      const statusText = {
        'completed': '已完成',
        'pending': '进行中',
        'failed': '已失败'
      };
      
      const content = `任务描述：${task.description}\n状态：${statusText[task.status]}\n可减少碳排放：${task.carbonSaved}kg CO2\n奖励：${task.reward} 碳积分`;
      
      uni.showModal({
        title: task.name,
        content: content,
        showCancel: false
      });
    },
    
    // 加载用户统计
    loadUserStats() {
      try {
        const stats = uni.getStorageSync('userStats');
        if (stats) {
          this.userStats = { ...this.userStats, ...stats };
        }
      } catch (e) {
        console.error('加载用户统计失败:', e);
      }
    },
    
    // 保存用户统计
    saveUserStats() {
      try {
        uni.setStorageSync('userStats', this.userStats);
      } catch (e) {
        console.error('保存用户统计失败:', e);
      }
    },
    
    // 加载任务进度
    loadTaskProgress() {
      try {
        const progress = uni.getStorageSync('taskProgress');
        if (progress) {
          this.tasks.forEach(task => {
            const saved = progress.find(p => p.id === task.id);
            if (saved) {
              task.status = saved.status;
              task.progress = saved.progress;
            }
          });
        }
      } catch (e) {
        console.error('加载任务进度失败:', e);
      }
    },
    
    // 保存任务进度
    saveTaskProgress() {
      try {
        const progress = this.tasks.map(task => ({
          id: task.id,
          status: task.status,
          progress: task.progress
        }));
        uni.setStorageSync('taskProgress', progress);
      } catch (e) {
        console.error('保存任务进度失败:', e);
      }
    },
    
    // 获取任务状态图标
    getStatusIcon(status) {
      const icons = {
        'completed': '✅',
        'pending': '⏳',
        'failed': '❌'
      };
      return icons[status] || '⏳';
    },
    
    // 获取任务操作按钮文字
    getActionText(task) {
      switch(task.status) {
        case 'completed':
          return '已完成';
        case 'failed':
          return '重新挑战';
        default:
          return '去完成';
      }
    },
    
    handleTaskAction(task) {
      if (task.status === 'completed') {
        return; // 已完成的任务不处理
      } else if (task.status === 'failed') {
        this.resetTask(task);
      } else {
        this.completeTask(task);
      }
    }
  }
};
</script>

<style lang="scss">
.tasks-container {
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
    height: 100rpx; // Adjust as needed, considering status bar
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    box-sizing: border-box;
    background-color: rgba(255,255,255,0.1); // Slight transparent white
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
    .placeholder {
      width: 50rpx; // Same as back button icon to center title
    }
  }

  .task-list-scroll {
    flex: 1;
    width: 100%;
  }

  .task-card {
    background-color: #fff;
    margin: 20rpx 30rpx;
    padding: 30rpx;
    border-radius: 15rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);

    .task-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .task-icon {
        font-size: 36rpx;
        margin-right: 20rpx;
      }
      .task-info {
        flex: 1;
        .task-name {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
        }
        .task-description {
          font-size: 24rpx;
          color: #777;
        }
      }
      .task-status-icon {
        font-size: 36rpx;
        margin-left: 20rpx;
        &.completed { color: #4CAF50; }
        &.failed { color: #f44336; }
        &.pending { color: #777; }
      }
    }

    .task-body {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .task-rewards {
        display: flex;
        align-items: center;
        margin-right: 30rpx;

        .reward-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-left: 10rpx;

          .reward-icon {
            font-size: 24rpx;
            margin-bottom: 5rpx;
          }
          .reward-text {
            font-size: 20rpx;
            color: #777;
          }
        }
      }
      
      .progress-section {
        flex: 1;
        margin-right: 30rpx;

        .progress-bar-container {
          height: 20rpx;
          background-color: #e0e0e0;
          border-radius: 10rpx;
          overflow: hidden;

          .progress-bar {
            height: 100%;
            background: linear-gradient(to right, #66bb6a, #388e3c);
            border-radius: 10rpx;
            position: relative;
            .progress-stripes {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.15) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.15) 50%,
                rgba(255, 255, 255, 0.15) 75%,
                transparent 75%,
                transparent
              );
              background-size: 40rpx 40rpx;
              animation: progress-bar-stripes 1s linear infinite;
            }
          }
        }
      }
      
      .progress-text {
        font-size: 20rpx;
        color: #777;
      }

      .task-action-button {
        background: linear-gradient(to right, #66bb6a, #388e3c);
        color: #fff;
        font-size: 26rpx;
        padding: 12rpx 25rpx;
        border-radius: 8rpx;
        border: none;
        white-space: nowrap;
        &:active {
          opacity: 0.8;
        }
        &.completed {
          background: #4CAF50;
        }
        &.failed {
          background: #f44336;
        }
        &:disabled {
          opacity: 0.5;
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

  .floating-button {
    position: fixed;
    right: 30rpx;
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #4CAF50, #8BC34A);
    border-radius: 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 25rpx rgba(76, 175, 80, 0.4);
    z-index: 50;

    &.add-task {
      bottom: 340rpx;
    }

    &.carbon-tracker {
      bottom: 200rpx;
    }

    .fab-icon {
      font-size: 36rpx;
      color: white;
      margin-bottom: 5rpx;
    }

    .fab-text {
      font-size: 20rpx;
      color: white;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .task-actions {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .delete-btn {
      font-size: 32rpx;
      padding: 10rpx;
      border-radius: 8rpx;
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .task-status-icon {
      font-size: 36rpx;
      &.completed { color: #4CAF50; }
      &.failed { color: #f44336; }
      &.pending { color: #777; }
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 30rpx;
  }

  .modal-content {
    background-color: #fff;
    border-radius: 20rpx;
    width: 100%;
    max-width: 600rpx;
    max-height: 80vh;
    overflow: hidden;

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      border-bottom: 1rpx solid #eee;

      .modal-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .modal-close {
        font-size: 36rpx;
        color: #999;
        padding: 10rpx;
      }
    }

    .modal-body {
      padding: 30rpx;
      max-height: 60vh;
      overflow-y: auto;

      .form-group {
        margin-bottom: 30rpx;

        &.half {
          flex: 1;
        }

        .form-label {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 15rpx;
          display: block;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 20rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 10rpx;
          font-size: 28rpx;
          box-sizing: border-box;
          background-color: #fff;

          &:focus {
            border-color: #4CAF50;
          }
        }

                .form-textarea {
          min-height: 120rpx;
          resize: none;
        }
      }

      .form-row {
        display: flex;
        gap: 20rpx;
      }

      .icon-selector {
        display: flex;
        white-space: nowrap;
        padding: 10rpx 0;

        .icon-option {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80rpx;
          height: 80rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 10rpx;
          margin-right: 15rpx;
          cursor: pointer;

          &.active {
            border-color: #4CAF50;
            background-color: rgba(76, 175, 80, 0.1);
          }

          .icon-text {
            font-size: 32rpx;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      padding: 30rpx;
      border-top: 1rpx solid #eee;
      gap: 20rpx;

      .btn-cancel, .btn-confirm {
        flex: 1;
        padding: 25rpx;
        border-radius: 10rpx;
        font-size: 28rpx;
        border: none;
        text-align: center;
      }

      .btn-cancel {
        background-color: #f0f0f0;
        color: #666;
      }

      .btn-confirm {
        background: linear-gradient(to right, #66bb6a, #388e3c);
        color: white;
      }
    }
  }

  .stats-card {
    background-color: #fff;
    margin: 20rpx 30rpx;
    padding: 30rpx;
    border-radius: 15rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-around;
    align-items: center;

    .stats-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .stats-number {
        font-size: 36rpx;
        font-weight: bold;
        color: #4CAF50;
        margin-bottom: 8rpx;
      }
      .stats-label {
        font-size: 24rpx;
        color: #777;
      }
    }

    .stats-divider {
      width: 2rpx;
      height: 60rpx;
      background-color: #e0e0e0;
    }
  }

  .loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60rpx 30rpx;

    .loading-icon {
      font-size: 48rpx;
      color: #4CAF50;
      margin-bottom: 20rpx;
      animation: rotation 1s linear infinite;
    }
    .loading-text {
      font-size: 28rpx;
      color: #666;
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60rpx 30rpx;

    .empty-icon {
      font-size: 80rpx;
      color: #ccc;
      margin-bottom: 20rpx;
    }
    .empty-text {
      font-size: 32rpx;
      color: #666;
      margin-bottom: 10rpx;
      font-weight: 500;
    }
    .empty-desc {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 30rpx;
      line-height: 1.4;
    }
    .reload-btn {
      background: linear-gradient(to right, #66bb6a, #388e3c);
      color: white;
      border: none;
      padding: 20rpx 40rpx;
      border-radius: 25rpx;
      font-size: 28rpx;
      &:active {
        opacity: 0.8;
      }
    }
  }
}

@keyframes progress-bar-stripes {
  from {
    background-position: 40rpx 0;
  }
  to {
    background-position: 0 0;
  }
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 