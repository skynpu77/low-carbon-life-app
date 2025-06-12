// API服务工具类 - 统一处理所有HTTP请求
import { AuthManager } from './auth.js';

class ApiService {
  constructor() {
    this.baseURL = 'https://zjzpdlofbddf.sealoshzh.site/api/v1';
    this.timeout = 10000; // 10秒超时
    
    // 请求限流控制
    this.requestQueue = new Map(); // 存储正在进行的请求
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // 最小请求间隔100ms
    this.rateLimitDelay = 1000; // 429错误后的延迟时间
    this.maxRetries = 2; // 最大重试次数
  }

  // 统一请求方法
  async request(url, options = {}) {
    const {
      method = 'GET',
      data = null,
      headers = {},
      needAuth = true,
      showLoading = true,
      retryCount = 0
    } = options;

    // 请求去重 - 如果相同请求正在进行，直接返回
    const requestKey = `${method}:${url}:${JSON.stringify(data)}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    // 创建请求Promise
    const requestPromise = this._executeRequest(url, {
      method,
      data,
      headers,
      needAuth,
      showLoading,
      retryCount
    });

    // 将请求加入队列
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // 请求完成后从队列中移除
      this.requestQueue.delete(requestKey);
    }
  }

  // 执行请求的内部方法
  async _executeRequest(url, options) {
    const {
      method = 'GET',
      data = null,
      headers = {},
      needAuth = true,
      showLoading = true,
      retryCount = 0
    } = options;

    // 请求限流 - 确保请求间隔
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this._delay(this.minRequestInterval - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    // 显示加载提示
    if (showLoading && retryCount === 0) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
    }

    try {
      // 构建请求头
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };

      // 添加认证token
      if (needAuth) {
        const token = AuthManager.getToken();
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }
      }

      // 发起请求
      const response = await this.makeRequest(url, {
        method,
        data,
        headers: requestHeaders
      });

      // 处理响应
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else if (response.data && response.data.code === 401) {
        // Token过期，尝试刷新
        const refreshResult = await this.refreshToken();
        if (refreshResult) {
          // 重试原请求
          return this._executeRequest(url, { ...options, retryCount: retryCount + 1 });
        } else {
          // 刷新失败，跳转登录
          AuthManager.logout();
          uni.redirectTo({ url: '/pages/login/login' });
          throw new Error('登录已过期，请重新登录');
        }
      } else {
        throw new Error(response.data?.message || '请求失败');
      }
    } catch (error) {
      // 处理429限流错误
      if (error.statusCode === 429 || error.message.includes('429')) {
        if (retryCount < this.maxRetries) {
          console.log(`请求被限流，${this.rateLimitDelay}ms后重试 (${retryCount + 1}/${this.maxRetries})`);
          await this._delay(this.rateLimitDelay * (retryCount + 1)); // 指数退避
          return this._executeRequest(url, { ...options, retryCount: retryCount + 1 });
        } else {
          console.log('请求频率过高，请稍后再试');
          throw new Error('请求频率过高，请稍后再试');
        }
      }

      // 处理其他错误
      if (!error.message.includes('503') && !error.message.includes('request:fail')) {
        console.error('API请求错误:', error);
      } else {
        console.log('API服务暂时不可用');
      }
      throw error;
    } finally {
      if (showLoading && retryCount === 0) {
        uni.hideLoading();
      }
    }
  }

  // 延迟工具方法
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 基础请求方法
  makeRequest(url, options) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${this.baseURL}${url}`,
        method: options.method,
        data: options.data,
        header: options.headers,
        timeout: this.timeout,
        success: resolve,
        fail: reject
      });
    });
  }

  // 刷新Token
  async refreshToken() {
    try {
      const refreshToken = uni.getStorageSync('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        data: { refreshToken },
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.code === 200) {
        const { token, refreshToken: newRefreshToken, expiresAt } = response.data.data;
        
        // 保存新的token
        uni.setStorageSync('token', token);
        uni.setStorageSync('refreshToken', newRefreshToken);
        uni.setStorageSync('tokenExpiresAt', expiresAt);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新Token失败:', error);
      return false;
    }
  }

  // GET请求
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  // POST请求
  post(url, data, options = {}) {
    return this.request(url, { ...options, method: 'POST', data });
  }

  // PUT请求
  put(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PUT', data });
  }

  // DELETE请求
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // 文件上传
  async uploadFile(filePath, options = {}) {
    const { 
      name = 'file',
      formData = {},
      showLoading = true 
    } = options;

    if (showLoading) {
      uni.showLoading({
        title: '上传中...',
        mask: true
      });
    }

    try {
      const token = AuthManager.getToken();
      const header = {};
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }

      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `${this.baseURL}/upload/single`,
          filePath,
          name,
          formData,
          header,
          success: (response) => {
            try {
              const data = JSON.parse(response.data);
              if (data.code === 200) {
                resolve({
                  success: true,
                  data: data.data,
                  message: data.message
                });
              } else {
                reject(new Error(data.message || '上传失败'));
              }
            } catch (error) {
              reject(new Error('响应解析失败'));
            }
          },
          fail: reject
        });
      });
    } catch (error) {
      throw error;
    } finally {
      if (showLoading) {
        uni.hideLoading();
      }
    }
  }
}

// 具体API接口类
class API {
  constructor() {
    this.service = new ApiService();
  }

  // ========== 认证相关 ==========
  // 用户注册
  register(data) {
    return this.service.post('/auth/register', data, { needAuth: false });
  }

  // 用户登录
  login(data) {
    return this.service.post('/auth/login', data, { needAuth: false });
  }

  // 刷新Token
  refreshToken(refreshToken) {
    return this.service.post('/auth/refresh', { refreshToken }, { needAuth: false });
  }

  // 登出
  logout() {
    const refreshToken = uni.getStorageSync('refreshToken');
    return this.service.post('/auth/logout', { refreshToken });
  }

  // ========== 首页数据 ==========
  // 获取首页数据
  getDashboard() {
    return this.service.get('/home/dashboard');
  }

  // 快速记录行为
  quickAction(data) {
    return this.service.post('/home/quick-action', data);
  }

  // ========== 任务系统 ==========
  // 获取任务列表
  getTasks(params = {}) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '')
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    return this.service.get(url);
  }

  // 更新任务进度
  updateTaskProgress(taskId, data) {
    return this.service.put(`/tasks/${taskId}/progress`, data);
  }

  // 完成任务
  completeTask(taskId, data = {}) {
    return this.service.post(`/tasks/${taskId}/complete`, data);
  }

  // ========== 数据统计 ==========
  // 获取数据概览
  getStatisticsOverview() {
    return this.service.get('/statistics/overview');
  }

  // 获取趋势数据
  getStatisticsTrends(period = 'week') {
    return this.service.get(`/statistics/trends?period=${period}`);
  }

  // 获取活动分布
  getStatisticsActivities(period = 'week') {
    return this.service.get(`/statistics/activities?period=${period}`);
  }

  // 获取月度对比
  getMonthlyComparison(months = 3) {
    return this.service.get(`/statistics/monthly-comparison?months=${months}`);
  }

  // 获取减排建议
  getSuggestions() {
    return this.service.get('/statistics/suggestions');
  }

  // ========== 个人中心 ==========
  // 获取用户信息
  getUserProfile() {
    return this.service.get('/user/profile');
  }

  // 获取用户统计
  getUserStats() {
    return this.service.get('/user/stats');
  }

  // 更新用户信息
  updateUserProfile(data) {
    return this.service.put('/user/profile', data);
  }

  // 获取用户设置
  getUserSettings() {
    return this.service.get('/user/settings');
  }

  // 更新用户设置
  updateUserSettings(data) {
    return this.service.put('/user/settings', data);
  }

  // ========== 碳足迹记录 ==========
  // 记录碳足迹
  recordCarbon(data) {
    return this.service.post('/carbon/record', data);
  }

  // 获取碳足迹历史
  getCarbonHistory(params = {}) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '')
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = queryString ? `/carbon/history?${queryString}` : '/carbon/history';
    return this.service.get(url);
  }

  // 获取今日碳足迹
  getTodayCarbon() {
    return this.service.get('/carbon/today');
  }

  // ========== 成就系统 ==========
  // 获取成就列表
  getAchievements() {
    return this.service.get('/achievements');
  }

  // ========== 系统配置 ==========
  // 获取系统配置
  getAppConfig() {
    return this.service.get('/config/app', { needAuth: false });
  }

  // 获取系统状态
  getSystemStatus() {
    return this.service.get('/config/status', { needAuth: false });
  }

  // ========== 文件上传 ==========
  // 上传单个文件
  uploadSingleFile(filePath) {
    return this.service.uploadFile(filePath);
  }

  // 上传多个文件
  async uploadMultipleFiles(filePaths) {
    const uploadPromises = filePaths.map(filePath => this.uploadSingleFile(filePath));
    return Promise.all(uploadPromises);
  }
}

// 创建API实例
const api = new API();

export default api; 