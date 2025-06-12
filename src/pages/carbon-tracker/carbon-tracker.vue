<template>
  <view class="tracker-container">
    <view class="background"></view>

    <!-- Custom Navigation Bar -->
    <view class="custom-nav-bar">
      <view class="back-button" @click="goBack">
        <text class="icon">‹</text>
      </view>
      <text class="nav-title">碳足迹记录</text>
      <view class="save-button" @click="saveRecord">
        <text class="save-text">保存</text>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y="true">
      <!-- 日期选择 -->
      <view class="section">
        <text class="section-title">记录日期</text>
        <view class="date-picker-card" @click="showDatePicker">
          <text class="date-text">{{ formatDate(selectedDate) }}</text>
          <text class="picker-icon">📅</text>
        </view>
      </view>

      <!-- 交通出行 -->
      <view class="section">
        <text class="section-title">🚗 交通出行</text>
        <view class="activity-card">
          <view class="input-group">
            <text class="label">出行方式</text>
            <picker :value="transportIndex" :range="transportOptions" @change="onTransportChange">
              <view class="picker-display">
                <text>{{ transportOptions[transportIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="input-group">
            <text class="label">距离 (公里)</text>
            <input class="number-input" type="number" v-model="activities.transport.distance" placeholder="0" />
          </view>
          <view class="input-group">
            <text class="label">同行人数</text>
            <input class="number-input" type="number" v-model="activities.transport.passengers" placeholder="1" />
          </view>
          <view class="emission-display">
            <text class="emission-text">碳排放: {{ calculateTransportEmission() }} kg CO₂</text>
          </view>
        </view>
      </view>

      <!-- 用电记录 -->
      <view class="section">
        <text class="section-title">⚡ 用电记录</text>
        <view class="activity-card">
          <view class="input-group">
            <text class="label">用电量 (度)</text>
            <input class="number-input" type="number" v-model="activities.electricity.kwh" placeholder="0" />
          </view>
          <view class="input-group">
            <text class="label">电力类型</text>
            <picker :value="electricityIndex" :range="electricityOptions" @change="onElectricityChange">
              <view class="picker-display">
                <text>{{ electricityOptions[electricityIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="emission-display">
            <text class="emission-text">碳排放: {{ calculateElectricityEmission() }} kg CO₂</text>
          </view>
        </view>
      </view>

      <!-- 饮食记录 -->
      <view class="section">
        <text class="section-title">🍽️ 饮食记录</text>
        <view class="activity-card">
          <view class="food-items">
            <view class="food-item" v-for="(food, index) in activities.food" :key="index">
              <view class="input-group">
                <text class="label">食物类型</text>
                <picker :value="food.typeIndex" :range="foodOptions" @change="onFoodTypeChange(index, $event)">
                  <view class="picker-display">
                    <text>{{ foodOptions[food.typeIndex] }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
              <view class="input-group">
                <text class="label">重量 (kg)</text>
                <input class="number-input" type="number" v-model="food.weight" placeholder="0" />
              </view>
              <view class="food-actions">
                <view class="remove-btn" @click="removeFood(index)" v-if="activities.food.length > 1">×</view>
              </view>
            </view>
          </view>
          <button class="add-food-btn" @click="addFood">+ 添加食物</button>
          <view class="emission-display">
            <text class="emission-text">碳排放: {{ calculateFoodEmission() }} kg CO₂</text>
          </view>
        </view>
      </view>

      <!-- 今日总计 -->
      <view class="section">
        <view class="total-card">
          <text class="total-title">今日碳足迹总计</text>
          <text class="total-emission">{{ getTotalEmission() }} kg CO₂</text>
          <view class="level-badge" :style="{ backgroundColor: carbonLevel.color }">
            <text class="level-icon">{{ carbonLevel.icon }}</text>
            <text class="level-text">{{ carbonLevel.level }}</text>
          </view>
        </view>
      </view>

      <!-- 减排建议 -->
      <view class="section" v-if="suggestions.length > 0">
        <text class="section-title">💡 减排建议</text>
        <view class="suggestion-card" v-for="(suggestion, index) in suggestions" :key="index">
          <text class="suggestion-category">{{ suggestion.category }}</text>
          <text class="suggestion-text">{{ suggestion.suggestion }}</text>
          <text class="potential-reduction">潜在减排: {{ suggestion.potential_reduction.toFixed(1) }} kg CO₂</text>
        </view>
      </view>
    </scroll-view>

    <!-- 日期选择器 -->
    <picker-view v-if="showDatePickerModal" class="date-picker-modal" :value="pickerValue" @change="onDatePickerChange">
      <picker-view-column>
        <view v-for="(year, index) in years" :key="index">{{ year }}</view>
      </picker-view-column>
      <picker-view-column>
        <view v-for="(month, index) in months" :key="index">{{ month }}</view>
      </picker-view-column>
      <picker-view-column>
        <view v-for="(day, index) in days" :key="index">{{ day }}</view>
      </picker-view-column>
    </picker-view>
  </view>
</template>

<script>
import { CarbonCalculator, CarbonDataManager } from '../../utils/carbonCalculator.js';
import { AuthManager } from '../../utils/auth.js';

export default {
  data() {
    return {
      selectedDate: new Date(),
      showDatePickerModal: false,
      pickerValue: [0, 0, 0],
      
      // 交通选项
      transportIndex: 0,
      transportOptions: ['步行', '自行车', '公交车', '地铁', '汽油车', '电动车', '火车'],
      transportTypes: ['walking', 'bicycle', 'bus', 'subway', 'car_gasoline', 'car_electric', 'train'],
      
      // 用电选项
      electricityIndex: 0,
      electricityOptions: ['居民用电', '商业用电', '可再生能源'],
      electricityTypes: ['residential', 'commercial', 'renewable'],
      
      // 食物选项
      foodOptions: ['蔬菜', '水果', '谷物', '鸡肉', '猪肉', '牛肉', '鱼类', '乳制品'],
      foodTypes: ['vegetables', 'fruits', 'grains', 'chicken', 'pork', 'beef', 'fish', 'dairy'],
      
      // 活动数据
      activities: {
        transport: {
          distance: 0,
          passengers: 1
        },
        electricity: {
          kwh: 0
        },
        food: [
          { typeIndex: 0, weight: 0 }
        ]
      },
      
      suggestions: []
    };
  },
  
  computed: {
    carbonLevel() {
      const totalEmission = this.getTotalEmission();
      return CarbonCalculator.getCarbonLevel(totalEmission * 30); // 估算月度排放
    },
    
    years() {
      const currentYear = new Date().getFullYear();
      return Array.from({length: 3}, (_, i) => currentYear - 1 + i);
    },
    
    months() {
      return Array.from({length: 12}, (_, i) => i + 1);
    },
    
    days() {
      const year = this.years[this.pickerValue[0]];
      const month = this.months[this.pickerValue[1]];
      const daysInMonth = new Date(year, month, 0).getDate();
      return Array.from({length: daysInMonth}, (_, i) => i + 1);
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    formatDate(date) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    showDatePicker() {
      this.showDatePickerModal = true;
    },
    
    onDatePickerChange(e) {
      this.pickerValue = e.detail.value;
      const year = this.years[this.pickerValue[0]];
      const month = this.months[this.pickerValue[1]];
      const day = this.days[this.pickerValue[2]];
      this.selectedDate = new Date(year, month - 1, day);
      this.showDatePickerModal = false;
    },
    
    onTransportChange(e) {
      this.transportIndex = e.detail.value;
    },
    
    onElectricityChange(e) {
      this.electricityIndex = e.detail.value;
    },
    
    onFoodTypeChange(index, e) {
      this.activities.food[index].typeIndex = e.detail.value;
    },
    
    addFood() {
      this.activities.food.push({ typeIndex: 0, weight: 0 });
    },
    
    removeFood(index) {
      this.activities.food.splice(index, 1);
    },
    
    calculateTransportEmission() {
      if (!this.activities.transport.distance) return 0;
      return CarbonCalculator.calculateTransportEmission(
        this.transportTypes[this.transportIndex],
        parseFloat(this.activities.transport.distance) || 0,
        parseInt(this.activities.transport.passengers) || 1
      ).toFixed(2);
    },
    
    calculateElectricityEmission() {
      if (!this.activities.electricity.kwh) return 0;
      return CarbonCalculator.calculateElectricityEmission(
        parseFloat(this.activities.electricity.kwh) || 0,
        this.electricityTypes[this.electricityIndex]
      ).toFixed(2);
    },
    
    calculateFoodEmission() {
      let total = 0;
      this.activities.food.forEach(food => {
        if (food.weight) {
          total += CarbonCalculator.calculateFoodEmission(
            this.foodTypes[food.typeIndex],
            parseFloat(food.weight) || 0
          );
        }
      });
      return total.toFixed(2);
    },
    
    getTotalEmission() {
      const transport = parseFloat(this.calculateTransportEmission()) || 0;
      const electricity = parseFloat(this.calculateElectricityEmission()) || 0;
      const food = parseFloat(this.calculateFoodEmission()) || 0;
      return (transport + electricity + food).toFixed(2);
    },
    
    generateSuggestions() {
      const footprint = {
        transport: parseFloat(this.calculateTransportEmission()) || 0,
        electricity: parseFloat(this.calculateElectricityEmission()) || 0,
        food: parseFloat(this.calculateFoodEmission()) || 0
      };
      this.suggestions = CarbonCalculator.getReductionSuggestions(footprint);
    },
    
    async saveRecord() {
      const dateStr = this.selectedDate.toISOString().split('T')[0];
      const totalEmission = parseFloat(this.getTotalEmission());
      
      // 构建记录数据
      const recordData = {
        date: dateStr,
        activities: [
          {
            type: 'transport',
            transportType: this.transportTypes[this.transportIndex],
            distance: parseFloat(this.activities.transport.distance) || 0,
            passengers: parseInt(this.activities.transport.passengers) || 1,
            emission: parseFloat(this.calculateTransportEmission()) || 0
          },
          {
            type: 'electricity',
            kwh: parseFloat(this.activities.electricity.kwh) || 0,
            energyType: this.electricityTypes[this.electricityIndex],
            emission: parseFloat(this.calculateElectricityEmission()) || 0
          },
          ...this.activities.food.map(food => ({
            type: 'food',
            foodType: this.foodTypes[food.typeIndex],
            weight: parseFloat(food.weight) || 0,
            emission: CarbonCalculator.calculateFoodEmission(
              this.foodTypes[food.typeIndex],
              parseFloat(food.weight) || 0
            )
          }))
        ],
        totalEmission
      };

      try {
        // 调用API保存碳足迹记录
        const response = await this.$api.recordCarbon(recordData);
        
        if (response.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(response.message || '保存失败');
        }
      } catch (error) {
        console.error('保存碳足迹记录失败:', error);
        
        // 使用本地保存作为备用
        this.saveRecordLocal(dateStr, recordData.activities);
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },

    // 本地保存记录
    saveRecordLocal(dateStr, activitiesData) {
      try {
        CarbonDataManager.saveDaily(dateStr, activitiesData);
      } catch (error) {
        console.error('本地保存失败:', error);
      }
    }
  },
  
  watch: {
    activities: {
      handler() {
        this.generateSuggestions();
      },
      deep: true
    }
  },
  
  onLoad() {
    // 检查登录状态
    if (!AuthManager.requireAuth()) {
      return;
    }
    
    this.generateSuggestions();
  }
};
</script>

<style lang="scss">
.tracker-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-top: 100rpx;

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

    .back-button .icon {
      font-size: 50rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .nav-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .save-button {
      padding: 12rpx 24rpx;
      background-color: rgba(255,255,255,0.2);
      border-radius: 20rpx;
      
      .save-text {
        color: #fff;
        font-size: 28rpx;
        font-weight: 500;
      }
    }
  }

  .content-scroll {
    flex: 1;
    width: 100%;
  }

  .section {
    margin: 30rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 20rpx;
      display: block;
    }
  }

  .date-picker-card {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);

    .date-text {
      font-size: 32rpx;
      color: #333;
    }
    
    .picker-icon {
      font-size: 40rpx;
    }
  }

  .activity-card {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);

    .input-group {
      margin-bottom: 25rpx;

      .label {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 10rpx;
        display: block;
      }

      .picker-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx;
        background-color: #f9f9f9;
        border-radius: 10rpx;
        font-size: 30rpx;
        
        .picker-arrow {
          color: #999;
        }
      }

      .number-input {
        width: 100%;
        padding: 24rpx;
        background-color: #f9f9f9;
        border-radius: 10rpx;
        font-size: 30rpx;
        border: none;
      }
    }

    .emission-display {
      text-align: right;
      margin-top: 20rpx;
      
      .emission-text {
        font-size: 28rpx;
        color: #4CAF50;
        font-weight: 500;
      }
    }
  }

  .food-item {
    border-bottom: 1rpx solid #f0f0f0;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    position: relative;
    
    .food-actions {
      position: absolute;
      top: 0;
      right: 0;
      
      .remove-btn {
        width: 40rpx;
        height: 40rpx;
        background-color: #ff4444;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        font-weight: bold;
      }
    }
  }

  .add-food-btn {
    width: 100%;
    padding: 20rpx;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 10rpx;
    font-size: 28rpx;
    margin: 20rpx 0;
  }

  .total-card {
    background: linear-gradient(135deg, #4CAF50, #8BC34A);
    border-radius: 15rpx;
    padding: 40rpx;
    text-align: center;
    color: white;
    box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);

    .total-title {
      font-size: 32rpx;
      margin-bottom: 10rpx;
      display: block;
    }

    .total-emission {
      font-size: 48rpx;
      font-weight: bold;
      margin-bottom: 20rpx;
      display: block;
    }

    .level-badge {
      display: inline-flex;
      align-items: center;
      padding: 12rpx 24rpx;
      border-radius: 25rpx;
      background-color: rgba(255, 255, 255, 0.2);

      .level-icon {
        margin-right: 10rpx;
        font-size: 30rpx;
      }

      .level-text {
        font-size: 28rpx;
        font-weight: 500;
      }
    }
  }

  .suggestion-card {
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    border-left: 8rpx solid #FF9800;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);

    .suggestion-category {
      font-size: 28rpx;
      color: #FF9800;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }

    .suggestion-text {
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;
      margin-bottom: 10rpx;
      display: block;
    }

    .potential-reduction {
      font-size: 24rpx;
      color: #4CAF50;
      font-weight: 500;
    }
  }
}
</style> 