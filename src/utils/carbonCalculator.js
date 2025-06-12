// 碳足迹计算工具
export class CarbonCalculator {
  // 碳排放因子 (kg CO2e)
  static EMISSION_FACTORS = {
    // 交通出行 (每公里)
    transport: {
      car_gasoline: 0.2,      // 汽油车
      car_diesel: 0.17,       // 柴油车
      car_electric: 0.05,     // 电动车
      bus: 0.08,              // 公交车
      subway: 0.04,           // 地铁
      train: 0.06,            // 火车
      plane_domestic: 0.25,   // 国内航班
      plane_international: 0.3, // 国际航班
      bicycle: 0,             // 自行车
      walking: 0,             // 步行
      motorcycle: 0.15        // 摩托车
    },
    
    // 用电 (每度电)
    electricity: {
      residential: 0.785,     // 居民用电
      commercial: 0.785,      // 商业用电
      renewable: 0.05         // 可再生能源
    },
    
    // 用水 (每吨)
    water: {
      tap_water: 0.91,        // 自来水
      hot_water: 3.2          // 热水
    },
    
    // 天然气 (每立方米)
    gas: {
      natural_gas: 2.162      // 天然气
    },
    
    // 食物 (每kg)
    food: {
      beef: 27.0,             // 牛肉
      pork: 12.1,             // 猪肉
      chicken: 6.9,           // 鸡肉
      fish: 6.1,              // 鱼类
      dairy: 3.2,             // 乳制品
      vegetables: 2.0,        // 蔬菜
      fruits: 1.1,            // 水果
      grains: 2.7,            // 谷物
      plant_protein: 2.0      // 植物蛋白
    },
    
    // 废物处理 (每kg)
    waste: {
      landfill: 1.38,         // 填埋
      incineration: 0.7,      // 焚烧
      recycling: -0.5,        // 回收（负值表示减排）
      composting: -0.3        // 堆肥
    }
  };

  // 计算交通出行碳足迹
  static calculateTransportEmission(transportType, distance, passengers = 1) {
    const factor = this.EMISSION_FACTORS.transport[transportType] || 0;
    return (factor * distance) / passengers;
  }

  // 计算用电碳足迹
  static calculateElectricityEmission(kwh, energyType = 'residential') {
    const factor = this.EMISSION_FACTORS.electricity[energyType] || 0.785;
    return factor * kwh;
  }

  // 计算用水碳足迹
  static calculateWaterEmission(liters, isHotWater = false) {
    const tons = liters / 1000;
    const factor = isHotWater ? 
      this.EMISSION_FACTORS.water.hot_water : 
      this.EMISSION_FACTORS.water.tap_water;
    return factor * tons;
  }

  // 计算食物碳足迹
  static calculateFoodEmission(foodType, weight) {
    const factor = this.EMISSION_FACTORS.food[foodType] || 0;
    return factor * weight;
  }

  // 计算废物处理碳足迹
  static calculateWasteEmission(wasteType, weight) {
    const factor = this.EMISSION_FACTORS.waste[wasteType] || 0;
    return factor * weight;
  }

  // 计算日均碳足迹
  static calculateDailyFootprint(activities) {
    let totalEmission = 0;
    
    activities.forEach(activity => {
      switch(activity.type) {
        case 'transport':
          totalEmission += this.calculateTransportEmission(
            activity.transportType, 
            activity.distance, 
            activity.passengers
          );
          break;
        case 'electricity':
          totalEmission += this.calculateElectricityEmission(
            activity.kwh, 
            activity.energyType
          );
          break;
        case 'water':
          totalEmission += this.calculateWaterEmission(
            activity.liters, 
            activity.isHotWater
          );
          break;
        case 'food':
          totalEmission += this.calculateFoodEmission(
            activity.foodType, 
            activity.weight
          );
          break;
        case 'waste':
          totalEmission += this.calculateWasteEmission(
            activity.wasteType, 
            activity.weight
          );
          break;
      }
    });
    
    return totalEmission;
  }

  // 计算减排量
  static calculateEmissionReduction(beforeActivities, afterActivities) {
    const beforeEmission = this.calculateDailyFootprint(beforeActivities);
    const afterEmission = this.calculateDailyFootprint(afterActivities);
    return Math.max(0, beforeEmission - afterEmission);
  }

  // 计算碳中和目标
  static calculateNeutralizationTarget(annualEmission) {
    return {
      daily_target: annualEmission / 365,
      monthly_target: annualEmission / 12,
      trees_needed: Math.ceil(annualEmission / 22), // 一棵树年吸收约22kg CO2
      solar_panels_needed: Math.ceil(annualEmission / 1200), // 1kW太阳能板年减排约1200kg CO2
      offset_cost_estimate: annualEmission * 15 // 碳抵消成本估算（每吨CO2约15美元）
    };
  }

  // 碳积分计算
  static calculateCarbonPoints(reductionKg) {
    // 每减少1kg CO2获得10积分
    return Math.floor(reductionKg * 10);
  }

  // 等级评定
  static getCarbonLevel(monthlyReduction) {
    if (monthlyReduction >= 100) return { level: '碳中和达人', icon: '🌟', color: '#FFD700' };
    if (monthlyReduction >= 50) return { level: '低碳先锋', icon: '🏆', color: '#FF6B35' };
    if (monthlyReduction >= 20) return { level: '环保践行者', icon: '🌱', color: '#4CAF50' };
    if (monthlyReduction >= 5) return { level: '低碳新手', icon: '🌿', color: '#8BC34A' };
    return { level: '待努力', icon: '📈', color: '#9E9E9E' };
  }

  // 生成减排建议
  static getReductionSuggestions(carbonFootprint) {
    const suggestions = [];
    
    if (carbonFootprint.transport > 50) {
      suggestions.push({
        category: '交通出行',
        suggestion: '建议多使用公共交通或骑行，可减少约30%的交通碳排放',
        potential_reduction: carbonFootprint.transport * 0.3
      });
    }
    
    if (carbonFootprint.electricity > 30) {
      suggestions.push({
        category: '用电习惯',
        suggestion: '调节空调温度至26°C，使用LED灯具，可减少约20%的用电碳排放',
        potential_reduction: carbonFootprint.electricity * 0.2
      });
    }
    
    if (carbonFootprint.food > 40) {
      suggestions.push({
        category: '饮食结构',
        suggestion: '增加蔬菜摄入，减少肉类消费，每周素食2-3天可减少约25%的饮食碳排放',
        potential_reduction: carbonFootprint.food * 0.25
      });
    }
    
    return suggestions;
  }
}

// 碳足迹数据存储工具
export class CarbonDataManager {
  static STORAGE_KEY = 'carbon_footprint_data';
  
  // 保存日常活动数据
  static saveDaily(date, activities) {
    const data = this.getData();
    data[date] = {
      activities,
      emission: CarbonCalculator.calculateDailyFootprint(activities),
      timestamp: Date.now()
    };
    uni.setStorageSync(this.STORAGE_KEY, data);
  }
  
  // 获取历史数据
  static getData() {
    return uni.getStorageSync(this.STORAGE_KEY) || {};
  }
  
  // 获取月度统计
  static getMonthlyStats(year, month) {
    const data = this.getData();
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    const monthlyData = Object.keys(data)
      .filter(date => date.startsWith(monthKey))
      .map(date => data[date]);
    
    const totalEmission = monthlyData.reduce((sum, day) => sum + day.emission, 0);
    const avgDaily = totalEmission / monthlyData.length || 0;
    
    return {
      total_emission: totalEmission,
      avg_daily: avgDaily,
      days_recorded: monthlyData.length,
      trend: this.calculateTrend(monthlyData)
    };
  }
  
  // 计算趋势
  static calculateTrend(data) {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-7).reduce((sum, day) => sum + day.emission, 0) / 7;
    const previous = data.slice(-14, -7).reduce((sum, day) => sum + day.emission, 0) / 7;
    
    if (recent < previous - 1) return 'decreasing';
    if (recent > previous + 1) return 'increasing';
    return 'stable';
  }

  // 获取今日数据
  static getTodayData() {
    const today = new Date().toISOString().split('T')[0];
    const data = this.getData();
    const todayData = data[today];
    
    if (todayData) {
      return {
        totalEmission: todayData.emission || 3.2,
        walkCount: todayData.walkCount || 0,
        vegetarianCount: todayData.vegetarianCount || 0,
        busCount: todayData.busCount || 0,
        energyCount: todayData.energyCount || 0
      };
    }
    
    // 返回默认数据
    return {
      totalEmission: 3.2,
      walkCount: 0,
      vegetarianCount: 0,
      busCount: 0,
      energyCount: 0
    };
  }

  // 添加快速操作记录
  static addQuickAction(actionType, date) {
    const data = this.getData();
    const today = date || new Date().toISOString().split('T')[0];
    
    if (!data[today]) {
      data[today] = {
        activities: [],
        emission: 3.2,
        walkCount: 0,
        vegetarianCount: 0,
        busCount: 0,
        energyCount: 0,
        timestamp: Date.now()
      };
    }
    
    // 增加对应操作的计数
    data[today][`${actionType}Count`] = (data[today][`${actionType}Count`] || 0) + 1;
    
    // 减少碳排放（简单模拟）
    const reductionMap = {
      walk: 0.5,
      vegetarian: 1.2,
      bus: 0.8,
      energy: 0.3
    };
    
    data[today].emission = Math.max(0, data[today].emission - (reductionMap[actionType] || 0));
    
    uni.setStorageSync(this.STORAGE_KEY, data);
  }
} 