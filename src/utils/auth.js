// 用户认证工具类
export class AuthManager {
  // 检查是否已登录
  static isLoggedIn() {
    const token = uni.getStorageSync('token');
    const user = uni.getStorageSync('user');
    return !!(token && user);
  }
  
  // 获取当前用户信息
  static getCurrentUser() {
    return uni.getStorageSync('user') || null;
  }
  
  // 登录 - 保存从API返回的用户信息和token
  static login(userData) {
    try {
      // 保存用户信息
      uni.setStorageSync('user', {
        userId: userData.userId,
        username: userData.username
      });
      
      // 保存token信息
      uni.setStorageSync('token', userData.token);
      uni.setStorageSync('refreshToken', userData.refreshToken);
      uni.setStorageSync('tokenExpiresAt', userData.expiresAt);
      uni.setStorageSync('loginTime', Date.now());
      
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  }
  
  // 登出
  static logout() {
    try {
      // 清除所有登录相关的存储
      uni.removeStorageSync('user');
      uni.removeStorageSync('token');
      uni.removeStorageSync('refreshToken');
      uni.removeStorageSync('tokenExpiresAt');
      uni.removeStorageSync('loginTime');
      
      // 跳转到登录页
      uni.redirectTo({ 
        url: '/pages/login/login',
        fail: () => {
          // 如果当前就在登录页，则不跳转
          console.log('已在登录页面');
        }
      });
      
      return true;
    } catch (error) {
      console.error('登出失败:', error);
      return false;
    }
  }

  // 获取Token
  static getToken() {
    return uni.getStorageSync('token');
  }

  // 获取RefreshToken
  static getRefreshToken() {
    return uni.getStorageSync('refreshToken');
  }

  // 检查Token是否过期
  static isTokenExpired() {
    const expiresAt = uni.getStorageSync('tokenExpiresAt');
    if (!expiresAt) return true;
    
    // 提前5分钟判断为过期，预留刷新时间
    const bufferTime = 5 * 60 * 1000; // 5分钟
    return Date.now() + bufferTime >= expiresAt;
  }

  // 更新Token信息
  static updateTokens(tokenData) {
    try {
      if (tokenData.token) {
        uni.setStorageSync('token', tokenData.token);
      }
      if (tokenData.refreshToken) {
        uni.setStorageSync('refreshToken', tokenData.refreshToken);
      }
      if (tokenData.expiresAt) {
        uni.setStorageSync('tokenExpiresAt', tokenData.expiresAt);
      }
      return true;
    } catch (error) {
      console.error('更新Token失败:', error);
      return false;
    }
  }
  
  // 需要登录才能访问的页面检查
  static requireAuth() {
    if (!this.isLoggedIn()) {
      uni.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          uni.reLaunch({
            url: '/pages/login/login'
          });
        }
      });
      return false;
    }
    return true;
  }
  
  // 获取记住的用户名
  static getRememberedUsername() {
    return uni.getStorageSync('rememberedUsername') || '';
  }

  // 保存记住的用户名
  static setRememberedUsername(username) {
    uni.setStorageSync('rememberedUsername', username);
  }

  // 清除记住的用户名
  static clearRememberedUsername() {
    uni.removeStorageSync('rememberedUsername');
  }

  // 导航守卫 - 检查页面是否需要登录
  static checkPageAuth(pageUrl) {
    // 不需要登录的页面列表
    const publicPages = [
      '/pages/login/login',
      '/pages/register/register'
    ];

    if (publicPages.includes(pageUrl)) {
      return true;
    }

    return this.requireAuth();
  }
} 