<template>
  <view class="login-container">
    <view class="background"></view>
    <view class="header">
      <text class="title">低碳生活, 从登录开始</text>
    </view>
    <view class="login-card">
      <view class="card-icon">
        <view class="icon-circle">
          <text class="icon-text">碳</text>
        </view>
            </view>
      <text class="card-title">请登录您的账号</text>
      <view class="input-group">
        <text class="label">用户名</text>
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input 
            ref="usernameInput"
            class="input" 
            type="text" 
            placeholder="请输入用户名" 
            v-model="username"
            maxlength="20"
          />
        </view>
      </view>
      <view class="input-group">
        <text class="label">密码</text>
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input 
            ref="passwordInput"
            class="input" 
            type="password" 
            placeholder="请输入密码" 
            v-model="password"
            maxlength="20"
          />
        </view>
      </view>
      <view class="options">
        <label class="checkbox-label" @click="toggleRemember">
          <view class="custom-checkbox">
            <view class="checkbox-inner" v-if="rememberMe"></view>
          </view>
          <text class="checkbox-text">记住我</text>
        </label>
        <text class="forgot-password">忘记密码?</text>
      </view>
      <button class="login-button" @click="login">
        <text class="button-text">登录</text>
      </button>
      <text class="register-link" @click="goToRegister">还没有账号? <text class="highlight">立即注册</text></text>
    </view>
  </view>
</template>

<script>
import { AuthManager } from '../../utils/auth.js';
import api from '../../utils/api.js';

export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: true
    };
  },
  onLoad() {
    // 检查是否已经登录
    if (AuthManager.isLoggedIn()) {
      // 如果已经登录，直接跳转到主页
      uni.reLaunch({
        url: '/pages/index/index'
      });
      return;
    }
    
    // 检查是否有记住的用户名
    const rememberedUsername = AuthManager.getRememberedUsername();
    if (rememberedUsername) {
      this.username = rememberedUsername;
      this.rememberMe = true;
    }
  },
  methods: {
    async login() {
      // 输入验证
      if (!this.username.trim()) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        });
        return;
      }
      
      if (!this.password.trim()) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }

      if (this.username.length < 2) {
        uni.showToast({
          title: '用户名至少2个字符',
          icon: 'none'
        });
        return;
      }

      if (this.password.length < 6) {
        uni.showToast({
          title: '密码至少6个字符',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 调用登录API
        const response = await api.login({
          username: this.username.trim(),
          password: this.password.trim(),
          rememberMe: this.rememberMe
        });

        if (response.success) {
          // 使用认证管理器保存登录信息
          const loginSuccess = AuthManager.login(response.data);
          
          if (loginSuccess) {
            // 保存记住的用户名
            if (this.rememberMe) {
              AuthManager.setRememberedUsername(this.username.trim());
            } else {
              AuthManager.clearRememberedUsername();
            }

            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
            
            // 跳转到首页
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            throw new Error('保存登录信息失败');
          }
        } else {
          throw new Error(response.message || '登录失败');
        }
      } catch (error) {
        console.error('登录失败:', error);
        uni.showToast({
          title: error.message || '登录失败，请重试',
          icon: 'none',
          duration: 3000
        });
      }
    },
    toggleRemember() {
      this.rememberMe = !this.rememberMe;
    },
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      });
    }
  },
};
</script>

<style lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  
  /* 确保所有input文字可见 */
  input {
    color: #222 !important;
    -webkit-text-fill-color: #222 !important;
    opacity: 1 !important;
  }

    .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, #aed581, #558b2f);
  }

    .header {
    position: relative;
    z-index: 1;
    margin-bottom: 60rpx;

    .title {
      font-size: 52rpx;
      font-weight: bold;
      background: linear-gradient(to right, #004d40, #1b5e20);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }
  }

  .login-card {
    position: relative;
    z-index: 1;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 50rpx 40rpx;
    margin: 40rpx;
    box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(100% - 80rpx);
    max-width: 600rpx;
    
    .card-icon {
      margin-bottom: 30rpx;

      .icon-circle {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background: linear-gradient(45deg, #4CAF50, #8BC34A);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6rpx 15rpx rgba(76, 175, 80, 0.3);
        
        .icon-text {
          font-size: 40rpx;
          color: white;
          font-weight: bold;
        }
      }
    }

    .card-title {
      font-size: 36rpx;
      color: #222;
      margin-bottom: 45rpx;
      text-align: center;
      font-weight: 500;
    }

    .input-group {
      margin-bottom: 35rpx;
      width: 100%;

      .label {
        font-size: 28rpx;
        color: #444;
        margin-bottom: 12rpx;
        display: block;
        font-weight: 500;
      }

      .input-wrapper {
        display: flex;
        align-items: center;
        background-color: #f9f9f9;
        border-radius: 10rpx;
        padding: 0 24rpx;
        transition: all 0.3s;
        height: 80rpx;
        cursor: text;
        
        &:focus-within {
          box-shadow: 0 0 0 2rpx rgba(76, 175, 80, 0.3);
          background-color: #fafafa;
          
          input {
            color: #222 !important;
            -webkit-text-fill-color: #222 !important;
          }
        }
        
        &:hover {
          background-color: #f5f5f5;
        }
        
        .input-icon {
          margin-right: 20rpx;
          font-size: 30rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80rpx;
          flex-shrink: 0;
        }
        
        .input {
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
          font-size: 30rpx;
          width: 100%;
          height: 80rpx;
          line-height: 80rpx;
          box-sizing: border-box;
          background-color: transparent;
          flex: 1;
          color: #222 !important;
          -webkit-appearance: none;
          appearance: none;
          position: relative;
          z-index: 1;
          font-weight: 500;
          vertical-align: middle;
          
          &::placeholder {
            color: #999;
          }
          
          /* H5特定样式 */
          &:focus {
            outline: none;
            border: none;
            background-color: transparent;
            color: #222 !important;
            -webkit-text-fill-color: #222 !important;
          }
          
          &:active {
            background-color: transparent;
            color: #222 !important;
            -webkit-text-fill-color: #222 !important;
          }
          
          &::-webkit-input-placeholder {
            color: #999;
          }
          
          &::-moz-placeholder {
            color: #999;
            opacity: 1;
          }
          
          &:-ms-input-placeholder {
            color: #999;
          }
          
          /* 确保输入框可点击 */
          pointer-events: auto;
          user-select: text;
          -webkit-user-select: text;
        }
      }
    }

    .options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 45rpx;
      width: 100%;

      .checkbox-label {
        display: flex;
        align-items: center;
        
        .custom-checkbox {
          width: 36rpx;
          height: 36rpx;
          border-radius: 6rpx;
          border: 2rpx solid #66bb6a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16rpx;
          background-color: #f9f9f9;
          transition: all 0.2s;
          
          .checkbox-inner {
            width: 24rpx;
            height: 24rpx;
            border-radius: 4rpx;
            background-color: #66bb6a;
          }
        }
        
        .checkbox-text {
          font-size: 28rpx;
          color: #555;
        }
      }

      .forgot-password {
        font-size: 28rpx;
        color: #1565c0;
        text-decoration: none;
      }
    }

    .login-button {
      background: linear-gradient(to right, #66bb6a, #388e3c);
      color: #fff;
      font-size: 34rpx;
      padding: 24rpx;
      border-radius: 10rpx;
      margin-bottom: 35rpx;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: none;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 6rpx 15rpx rgba(76, 175, 80, 0.3);
      
      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.2);
      }
      
      .button-text {
        font-weight: 500;
      }
    }

    .register-link {
      font-size: 30rpx;
      color: #555;
      text-align: center;
      
      .highlight {
        color: #1976D2;
      }
    }
  }
}
</style> 