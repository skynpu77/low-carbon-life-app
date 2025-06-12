<template>
  <view class="register-container">
    <view class="background"></view>
    <view class="header">
      <text class="title">加入我们, 低碳生活</text>
    </view>
    <view class="register-card">
      <view class="card-icon">
        <view class="icon-circle">
          <text class="icon-text">+碳</text>
        </view>
      </view>
      <text class="card-title">请注册您的账号</text>
      <view class="input-group">
        <text class="label">账号</text>
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input class="input" type="text" placeholder="请输入账号" v-model="account" />
        </view>
      </view>
      <view class="input-group">
        <text class="label">密码</text>
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input class="input" type="password" placeholder="请输入密码" v-model="password" />
        </view>
      </view>
      
      <view class="input-group">
        <text class="label">确认密码</text>
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input class="input" type="password" placeholder="请再次输入密码" v-model="confirmPassword" />
        </view>
      </view>
      
      <button class="register-button" @click="register">
        <text class="button-text">注册</text>
      </button>
      <text class="login-link" @click="goToLogin">已有账号? <text class="highlight">立即登录</text></text>
    </view>
  </view>
</template>

<script>
import { AuthManager } from '../../utils/auth.js';

export default {
  data() {
    return {
      account: '',
      password: '',
      confirmPassword: '',
    };
  },
  
  onLoad() {
    // 检查是否已经登录
    if (AuthManager.isLoggedIn()) {
      // 如果已经登录，直接跳转到主页
      uni.reLaunch({
        url: '/pages/tasks/tasks'
      });
    }
  },
  
  methods: {
    async register() {
      // 表单验证
      if (!this.account.trim()) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        });
        return;
      }
      
      if (this.account.length < 2 || this.account.length > 20) {
        uni.showToast({
          title: '账号长度为2-20个字符',
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
      
      if (this.password.length < 6 || this.password.length > 20) {
        uni.showToast({
          title: '密码长度为6-20个字符',
          icon: 'none'
        });
        return;
      }
      
      if (!this.confirmPassword.trim()) {
        uni.showToast({
          title: '请确认密码',
          icon: 'none'
        });
        return;
      }
      
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次密码不一致',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 调用注册API
        const response = await this.$api.register({
          username: this.account.trim(),
          password: this.password.trim()
        });

        if (response.success) {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          });
          
          // 注册成功后跳转到登录页
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
              fail: () => {
                uni.redirectTo({
                  url: '/pages/login/login'
                });
              }
            });
          }, 1500);
        } else {
          throw new Error(response.message || '注册失败');
        }
      } catch (error) {
        console.error('注册失败:', error);
        uni.showToast({
          title: error.message || '注册失败，请重试',
          icon: 'none',
          duration: 3000
        });
      }
    },
    
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }
  },
};
</script>

<style lang="scss">
.register-container {
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
    /* Green linear gradient background */
    background: linear-gradient(to bottom right, #aed581, #558b2f);
    /* Remove previous solid color and dot pattern */
    // background-color: #8bc34a;
    // background-image: radial-gradient(circle, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    // background-size: 20rpx 20rpx;
  }

  .header {
    position: relative;
    z-index: 1;
    margin-bottom: 60rpx; /* Increased space below title */

    .title {
      font-size: 52rpx; /* Slightly larger font */
      font-weight: bold;
      
      /* Dark green gradient for text */
      background: linear-gradient(to right, #004d40, #1b5e20);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent; /* Fallback for non-webkit browsers */
    }
  }

  .register-card {
    position: relative;
    z-index: 1;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 50rpx 40rpx;
    margin: 40rpx;
    box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.1); /* Enhanced shadow */
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(100% - 80rpx); /* Adjust for padding and margin */
    max-width: 600rpx; /* Max width for larger screens */
    
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

    .register-button {
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

    .login-link {
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