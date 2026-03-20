# 开发实施步骤指南

本文档提供详细的开发实施步骤，帮助开发团队按照正确的顺序完成项目开发。

## 阶段一：环境准备与基础搭建

### 步骤 1：安装依赖
```bash
# 安装状态管理库
npm install pinia

# 安装工具库
npm install dayjs

# 安装类型支持
npm install -D @types/node
```

### 步骤 2：创建基础目录结构
创建以下目录：
- `config/` - 配置文件
- `utils/` - 工具函数
- `api/` - API接口
- `store/` - 状态管理
- `build/` - 打包配置
- `static/video/` - 视频资源

### 步骤 3：申请各平台开发者账号
- [ ] Apple Developer 账号（iOS）
- [ ] 小米开发者账号
- [ ] VIVO开发者账号
- [ ] 荣耀开发者账号
- [ ] 华为开发者账号（鸿蒙）

### 步骤 4：申请支付权限
- [ ] Apple IAP 配置
- [ ] 小米支付权限
- [ ] VIVO支付权限
- [ ] 荣耀支付权限
- [ ] 华为IAP权限

---

## 阶段二：核心配置文件开发

### 步骤 5：创建支付配置文件
文件：[`config/payment.config.ts`](config/payment.config.ts)

关键内容：
- 定义商品ID
- 配置价格信息
- 设置订阅周期
- 各平台AppKey配置

### 步骤 6：创建渠道配置文件
文件：[`config/channel.config.ts`](config/channel.config.ts)

关键内容：
- 渠道标识定义
- 渠道特定参数
- 渠道识别规则

### 步骤 7：创建应用配置文件
文件：[`config/app.config.ts`](config/app.config.ts)

关键内容：
- API基础地址
- 应用版本信息
- 功能开关配置

---

## 阶段三：工具函数开发

### 步骤 8：创建渠道识别工具
文件：[`utils/payment/channel.ts`](utils/payment/channel.ts)

功能：
- 识别当前运行平台
- 识别应用渠道
- 获取渠道配置

### 步骤 9：创建本地存储工具
文件：[`utils/storage.ts`](utils/storage.ts)

功能：
- 封装uni.storage API
- 实现数据加密
- 实现过期管理

### 步骤 10：创建日志工具
文件：[`utils/logger.ts`](utils/logger.ts)

功能：
- 日志分级记录
- 错误追踪
- 日志上报

### 步骤 11：创建支付验证工具
文件：[`utils/payment/validator.ts`](utils/payment/validator.ts)

功能：
- 收据验证
- 订单验证
- 签名验证

---

## 阶段四：统一支付模块开发

### 步骤 12：定义支付接口类型
文件：[`uni_modules/wor-payment/types.ts`](uni_modules/wor-payment/types.ts)

定义：
- PaymentConfig 接口
- PaymentResult 接口
- IPaymentService 接口
- 商品信息类型

### 步骤 13：实现支付工厂
文件：[`uni_modules/wor-payment/factory.ts`](uni_modules/wor-payment/factory.ts)

功能：
- 根据平台创建支付实例
- 使用条件编译区分平台
- 实现单例模式

### 步骤 14：实现iOS支付
文件：[`uni_modules/wor-payment/ios/index.ts`](uni_modules/wor-payment/ios/index.ts)

功能：
- 封装 sn-uts-iap 模块
- 实现 IPaymentService 接口
- 处理iOS特定逻辑

测试：
- 沙盒环境测试
- 订阅购买流程
- 收据验证

### 步骤 15：创建支付模块入口
文件：[`uni_modules/wor-payment/index.ts`](uni_modules/wor-payment/index.ts)

功能：
- 导出统一接口
- 导出类型定义
- 提供便捷方法

---

## 阶段五：状态管理开发

### 步骤 16：配置Pinia
文件：[`store/index.ts`](store/index.ts)

功能：
- 创建Pinia实例
- 配置持久化插件
- 导出store

### 步骤 17：创建订阅状态管理
文件：[`store/modules/subscription.ts`](store/modules/subscription.ts)

状态：
- 订阅状态
- 订阅信息
- 商品列表

方法：
- 检查订阅状态
- 加载商品列表
- 发起订阅
- 恢复购买

### 步骤 18：创建用户状态管理
文件：[`store/modules/user.ts`](store/modules/user.ts)

状态：
- 用户信息
- 用户权益
- 引导状态

方法：
- 获取用户信息
- 更新用户权益
- 标记引导完成

---

## 阶段六：API接口开发

### 步骤 19：创建订阅API
文件：[`api/subscription.ts`](api/subscription.ts)

接口：
- 查询订阅状态
- 验证支付收据
- 同步订阅信息
- 取消订阅

### 步骤 20：创建用户API
文件：[`api/user.ts`](api/user.ts)

接口：
- 获取用户信息
- 查询用户权益
- 更新用户设置

---

## 阶段七：视频引导页开发

### 步骤 21：准备引导视频
- 设计引导内容
- 录制/制作视频
- 压缩优化视频（建议<5MB）
- 放置到 `static/video/guide.mp4`

### 步骤 22：创建引导页面
文件：[`pages/guide/guide.vue`](pages/guide/guide.vue)

功能：
- 视频播放
- 跳过按钮（3秒后显示）
- 进度指示器
- 完成后跳转

### 步骤 23：更新启动流程
修改：[`pages/startpage/startpage.vue`](pages/startpage/startpage.vue)

逻辑：
1. 检查网络
2. 检查是否首次启动
3. 首次启动 → 引导页
4. 非首次 → 主页

### 步骤 24：更新pages.json
添加引导页路由配置

---

## 阶段八：订阅页面开发

### 步骤 25：创建订阅页面
文件：[`pages/payment/subscription.vue`](pages/payment/subscription.vue)

功能：
- 展示订阅套餐
- 显示价格和优惠
- 发起订阅购买
- 显示当前订阅状态
- 管理订阅按钮

### 步骤 26：创建支付结果页
文件：[`pages/payment/payment-result.vue`](pages/payment/payment-result.vue)

功能：
- 显示支付结果
- 成功/失败提示
- 跳转到相应页面

### 步骤 27：集成到主页
修改：[`pages/index/index.vue`](pages/index/index.vue)

添加：
- 订阅状态显示
- 订阅入口按钮
- 权益提示

---

## 阶段九：Android支付开发

### 步骤 28：创建小米支付UTS插件
目录：`uni_modules/wor-payment/utssdk/app-android/xiaomi/`

任务：
1. 下载小米游戏中心SDK
2. 创建UTS插件结构
3. 封装原生API
4. 实现 IPaymentService 接口

文件：[`uni_modules/wor-payment/android/xiaomi/index.ts`](uni_modules/wor-payment/android/xiaomi/index.ts)

### 步骤 29：创建VIVO支付UTS插件
目录：`uni_modules/wor-payment/utssdk/app-android/vivo/`

任务：
1. 下载VIVO开放平台SDK
2. 创建UTS插件结构
3. 封装原生API
4. 实现 IPaymentService 接口

文件：[`uni_modules/wor-payment/android/vivo/index.ts`](uni_modules/wor-payment/android/vivo/index.ts)

### 步骤 30：创建荣耀支付UTS插件
目录：`uni_modules/wor-payment/utssdk/app-android/honor/`

任务：
1. 下载荣耀应用市场SDK
2. 创建UTS插件结构
3. 封装原生API
4. 实现 IPaymentService 接口

文件：[`uni_modules/wor-payment/android/honor/index.ts`](uni_modules/wor-payment/android/honor/index.ts)

### 步骤 31：更新支付工厂
修改：[`uni_modules/wor-payment/factory.ts`](uni_modules/wor-payment/factory.ts)

添加Android平台的支付实例创建逻辑

---

## 阶段十：鸿蒙支付开发

### 步骤 32：创建鸿蒙支付UTS插件
目录：`uni_modules/wor-payment/utssdk/app-harmony/`

任务：
1. 下载华为IAP SDK
2. 创建UTS插件结构
3. 封装原生API
4. 实现 IPaymentService 接口

文件：[`uni_modules/wor-payment/harmony/index.ts`](uni_modules/wor-payment/harmony/index.ts)

### 步骤 33：更新支付工厂
添加鸿蒙平台的支付实例创建逻辑

---

## 阶段十一：渠道打包配置

### 步骤 34：创建渠道配置文件
创建以下文件：
- [`build/channels/ios.json`](build/channels/ios.json)
- [`build/channels/xiaomi.json`](build/channels/xiaomi.json)
- [`build/channels/vivo.json`](build/channels/vivo.json)
- [`build/channels/honor.json`](build/channels/honor.json)
- [`build/channels/harmony.json`](build/channels/harmony.json)

配置内容：
- 平台标识
- 包名/BundleID
- AppKey/AppSecret
- 商品ID映射

### 步骤 35：创建打包脚本
文件：[`build/scripts/build-channels.js`](build/scripts/build-channels.js)

功能：
- 读取渠道配置
- 更新manifest.json
- 复制渠道资源
- 执行打包命令

### 步骤 36：准备渠道资源
为每个渠道准备：
- 应用图标
- 启动图
- 渠道特定资源

---

## 阶段十二：测试与优化

### 步骤 37：功能测试
测试项：
- [ ] 引导页播放和跳过
- [ ] iOS订阅购买流程
- [ ] 小米支付流程
- [ ] VIVO支付流程
- [ ] 荣耀支付流程
- [ ] 鸿蒙支付流程
- [ ] 订阅状态同步
- [ ] 恢复购买功能
- [ ] 支付异常处理

### 步骤 38：兼容性测试
测试设备：
- [ ] iPhone（iOS 14+）
- [ ] 小米手机
- [ ] VIVO手机
- [ ] 荣耀手机
- [ ] 鸿蒙设备

### 步骤 39：性能优化
优化项：
- [ ] 视频加载优化
- [ ] 支付响应速度
- [ ] 页面加载速度
- [ ] 内存占用优化

### 步骤 40：安全加固
加固项：
- [ ] 支付参数加密
- [ ] 收据验证
- [ ] 防重放攻击
- [ ] 敏感信息保护

---

## 阶段十三：打包发布

### 步骤 41：生成各渠道包
```bash
# 执行打包脚本
node build/scripts/build-channels.js
```

生成：
- iOS App Store包
- 小米应用商店包
- VIVO应用商店包
- 荣耀应用商店包
- 鸿蒙应用市场包

### 步骤 42：提交审核
提交到各应用商店：
- [ ] Apple App Store
- [ ] 小米应用商店
- [ ] VIVO应用商店
- [ ] 荣耀应用商店
- [ ] 华为应用市场

### 步骤 43：监控与反馈
上线后监控：
- 支付成功率
- 崩溃率
- 用户反馈
- 性能指标

---

## 关键注意事项

### 开发注意事项
1. 使用条件编译区分不同平台代码
2. 做好错误处理和日志记录
3. 支付流程要有完整的状态管理
4. 收据验证必须在服务器端进行

### 测试注意事项
1. iOS使用沙盒账号测试
2. Android各厂商使用测试环境
3. 测试各种异常情况
4. 测试网络异常情况

### 安全注意事项
1. 不要在客户端存储敏感信息
2. 支付参数要加密传输
3. 收据验证要防止重放攻击
4. 定期更新SDK版本

### 审核注意事项
1. 遵守各平台审核规则
2. 准备好测试账号
3. 提供详细的功能说明
4. 准备好隐私政策

---

## 开发时间估算

| 阶段 | 预计时间 | 说明 |
|------|---------|------|
| 环境准备 | 1-2天 | 账号申请可能需要更长时间 |
| 基础配置 | 1天 | 配置文件和工具函数 |
| iOS支付 | 3-4天 | 基于现有模块，相对简单 |
| 引导页 | 2-3天 | 包含视频制作时间 |
| 订阅页面 | 3-4天 | UI和交互开发 |
| Android支付 | 10-15天 | 三个厂商，每个3-5天 |
| 鸿蒙支付 | 4-5天 | 新平台，需要学习 |
| 打包配置 | 2-3天 | 脚本和配置 |
| 测试优化 | 5-7天 | 全面测试 |
| **总计** | **31-45天** | 约1.5-2个月 |

注意：以上时间为开发时间，不包括账号申请、审核等待等时间。

---

## 资源清单

### 必需资源
- [ ] 各平台开发者账号
- [ ] 支付权限和密钥
- [ ] 测试设备
- [ ] 引导视频素材
- [ ] UI设计稿

### 技术文档
- [ ] uni-app官方文档
- [ ] UTS插件开发文档
- [ ] 小米支付SDK文档
- [ ] VIVO支付SDK文档
- [ ] 荣耀支付SDK文档
- [ ] 华为IAP文档
- [ ] Apple StoreKit文档

### 开发工具
- [ ] HBuilderX
- [ ] Xcode（iOS开发）
- [ ] Android Studio（Android开发）
- [ ] DevEco Studio（鸿蒙开发）
