# 🌱 低碳生活管理应用

一个基于 Vue3 + uni-app 开发的跨平台低碳生活管理应用，帮助用户记录、分析和改善个人碳足迹，培养环保生活习惯。

是西北工业大学碳中和技术与前景课程大作业

## 📱 应用截图

> 支持微信小程序、H5、App等多端运行

## ✨ 核心功能

### 🏠 智能首页
- **实时碳足迹显示** - 今日碳排放量动态展示
- **快速操作记录** - 一键记录步行、素食、公交、节电等环保行为
- **任务快览** - 显示今日推荐任务和完成进度
- **本周趋势图** - 可视化展示一周碳排放变化
- **环保小贴士** - 轮播显示低碳生活建议

### 📋 任务中心
- **系统任务** - 10+预设环保任务，涵盖出行、饮食、节能等方面
- **自定义任务** - 用户可创建个性化低碳任务
- **任务管理** - 支持任务完成、进度跟踪、积分奖励
- **碳足迹记录** - 快速跳转到碳足迹记录页面

### 📊 数据统计
- **碳足迹概览** - 今日/本月碳排放统计
- **趋势分析** - 7天碳排放趋势图表
- **活动分布** - 各类活动的碳排放占比分析
- **月度对比** - 近3个月碳排放对比
- **减排建议** - 基于数据分析的个性化建议

### 👤 个人中心
- **用户资料** - 个人信息管理和展示
- **成就系统** - 6种环保成就，激励持续参与
- **统计数据** - 总减排量、等级、完成率等
- **设置管理** - 通知、主题、数据同步等个性化设置

### 📈 碳足迹记录
- **活动记录** - 详细记录各类日常活动
- **碳排放计算** - 基于科学算法自动计算碳足迹
- **历史查询** - 查看历史碳足迹记录

## 🛠 技术栈

### 前端技术
- **框架**: Vue 3.x + uni-app
- **构建工具**: HBuilderX / Vite
- **样式**: SCSS + 响应式设计
- **状态管理**: Vuex (可选)
- **HTTP客户端**: uni.request 封装

### 后端技术 (推荐)
- **运行环境**: Node.js
- **框架**: Express.js / Koa.js
- **数据库**: MySQL / MongoDB
- **认证**: JWT Token
- **API文档**: Swagger

### 开发工具
- **IDE**: HBuilderX / VS Code
- **版本控制**: Git
- **包管理**: npm / yarn
- **调试**: 微信开发者工具

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- HBuilderX >= 3.0.0
- 微信开发者工具 (小程序开发)

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/my-vue3-project.git
cd my-vue3-project
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置API地址**
```javascript
// src/utils/api.js
const baseURL = 'https://your-api-domain.com/api/v1';
```

4. **运行项目**

**微信小程序:**
- 使用HBuilderX打开项目
- 点击"运行" → "运行到小程序模拟器" → "微信开发者工具"

**H5:**
```bash
npm run dev:h5
```

**App:**
- 使用HBuilderX运行到手机或模拟器

## 📁 项目结构

```
my-vue3-project/
├── src/
│   ├── pages/                 # 页面文件
│   │   ├── index/            # 首页
│   │   ├── tasks/            # 任务中心
│   │   ├── data/             # 数据统计
│   │   ├── profile/          # 个人中心
│   │   ├── login/            # 登录页面
│   │   ├── register/         # 注册页面
│   │   └── carbon-tracker/   # 碳足迹记录
│   ├── components/           # 公共组件
│   ├── utils/               # 工具类
│   │   ├── api.js           # API封装
│   │   ├── auth.js          # 认证管理
│   │   └── carbonCalculator.js # 碳足迹计算
│   ├── static/              # 静态资源
│   ├── App.vue              # 应用入口
│   ├── main.js              # 主入口文件
│   └── pages.json           # 页面配置
├── package.json             # 项目配置
├── manifest.json            # 应用配置
└── README.md               # 项目说明
```

## 🔧 核心功能实现

### API服务层
```javascript
// src/utils/api.js - 统一API管理
class ApiService {
  // 请求限流和重试机制
  // JWT Token自动管理
  // 错误处理和降级
}
```

### 碳足迹计算
```javascript
// src/utils/carbonCalculator.js - 科学计算碳排放
class CarbonCalculator {
  // 交通、用电、用水、食物等碳排放计算
  // 减排量计算和等级评定
  // 个性化建议生成
}
```

### 认证管理
```javascript
// src/utils/auth.js - 用户认证
class AuthManager {
  // JWT Token管理
  // 登录状态检查
  // 自动跳转处理
}
```

## 🌐 API接口文档

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新Token
- `POST /auth/logout` - 用户登出

### 任务管理
- `GET /tasks` - 获取任务列表
- `POST /tasks/:id/complete` - 完成任务
- `PUT /tasks/:id/progress` - 更新任务进度

### 数据统计
- `GET /statistics/overview` - 获取统计概览
- `GET /statistics/trends` - 获取趋势数据
- `GET /statistics/activities` - 获取活动分布

### 用户管理
- `GET /user/profile` - 获取用户资料
- `PUT /user/profile` - 更新用户资料
- `GET /user/stats` - 获取用户统计

## 🎯 特色亮点

### 1. 离线优先设计
- **本地数据备用** - API不可用时自动使用本地数据
- **渐进式增强** - 优先保证基础功能可用
- **数据同步** - 网络恢复后自动同步数据

### 2. 智能限流机制
- **请求去重** - 避免重复请求
- **频率控制** - 智能控制请求间隔
- **错误重试** - 429错误自动重试

### 3. 科学碳足迹计算
- **多维度计算** - 涵盖交通、用电、饮食等各个方面
- **实时更新** - 动态计算和显示碳排放数据
- **个性化建议** - 基于用户行为提供减排建议

### 4. 跨平台兼容
- **一套代码** - 支持小程序、H5、App多端运行
- **响应式设计** - 适配不同屏幕尺寸
- **原生体验** - 接近原生应用的用户体验

## 🔒 数据安全

- **JWT认证** - 安全的用户身份验证
- **数据加密** - 敏感数据本地加密存储
- **权限控制** - 基于角色的访问控制
- **隐私保护** - 严格遵守数据隐私规范

## 📈 性能优化

- **懒加载** - 页面和组件按需加载
- **图片优化** - 自动压缩和格式转换
- **缓存策略** - 智能缓存静态资源
- **代码分割** - 减少首屏加载时间

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [uni-app](https://uniapp.dcloud.io/) - 跨平台应用开发框架
- [HBuilderX](https://www.dcloud.io/hbuilderx.html) - 高效的前端开发工具

## 📞 联系方式

- **项目地址**: https://github.com/skynpu77/low-carbon-life-app
- **问题反馈**: https://github.com/skynpu77/low-carbon-life-app/issues
- **邮箱**:sky04026npu@gmail.com

## 🔄 更新日志

### v1.0.0 (2024-01-15)
- ✨ 完成核心功能开发
- 🔧 实现API集成和错误处理
- 📱 支持微信小程序和H5端
- 🎨 优化UI设计和用户体验

---

**让我们一起为地球的绿色未来贡献力量！** 🌍💚 