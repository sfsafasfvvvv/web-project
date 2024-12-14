# 大学生二手交易平台

## 项目结构
```
campus-marketplace/
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   └── icons/             # 图标资源
├── src/                   # 源代码
│   ├── components/        # 可复用组件
│   │   ├── Header/       # 头部组件
│   │   ├── Footer/       # 底部组件
│   │   └── Product/      # 商品相关组件
│   ├── pages/            # 页面组件
│   │   ├── Home/         # 首页
│   │   ├── Product/      # 商品页
│   │   ├── User/         # 用户中心
│   │   └── Auth/         # 认证页面
│   ├── services/         # 服务层
│   │   ├── api/          # API 接口
│   │   ├── auth/         # 认证服务
│   │   └── storage/      # 存储服务
│   ├── utils/            # 工具函数
│   └── styles/           # 样式文件
├── public/               # 公共资源
└── server/              # 后端服务器代码
    ├── controllers/     # 控制器
    ├── models/         # 数据模型
    ├── routes/         # 路由
    └── config/         # 配置文件
```

## 待添加的图片资源
目前项目中的图片资源使用纯色背景临时替代，需要添加以下图片：

1. 首页轮播图
   - 位置：`src/pages/Home/HomePage.vue`
   - 数量：3张
   - 建议尺寸：1920x400px
   - 当前颜色：浅蓝色、浅绿色、浅橙色背景

2. 商品展示图
   - 位置：`src/pages/Home/HomePage.vue`
   - 建议尺寸：400x400px
   - 当前颜色：浅灰色背景

3. 新闻图片
   - 位置：`src/pages/Home/HomePage.vue`
   - 数量：3张
   - 建议尺寸：800x400px
   - 当前颜色：浅灰色、浅紫色、浅蓝色背景

4. 用户中心图片
   - 位置：`src/pages/User/UserCenter.vue`
   - 用户头像：200x200px，浅灰色背景
   - 商品图片：400x400px，浅灰色背景
   - 订单商品图片：200x200px，浅灰色背景

5. 商品详情图片
   - 位置：`src/pages/Product/ProductDetailPage.vue`
   - 商品轮播图：800x800px，浅灰色背景
   - 详情图片：800x自适应，浅灰色背景
   - 卖家头像：100x100px，浅灰色背景
   - 相似商品图片：200x200px，浅灰色背景

6. 商品发布页面
   - 位置：`src/pages/Product/PublishPage.vue`
   - 上传预览图：400x400px，浅灰色背景
   - 预览占位图：200x200px，浅灰色背景

添加图片时注意：
1. 图片应放置在 `public/images` 目录下
2. 使用适当的图片格式（推荐 WebP 或优化后的 JPEG/PNG）
3. 考虑图片加载性能，进行适当的压缩
4. 所有图片引用路径以 `/images/` 开头
5. 用户上传的图片应该有单独的存储和处理策略

图片命名规范：
- 首页轮播图：`banner-1.jpg`, `banner-2.jpg`, `banner-3.jpg`
- 商品图片：`product-default.jpg`
- 用户头像：`avatar-default.jpg`
- 新闻图片：`news-1.jpg`, `news-2.jpg`, `news-3.jpg`
- 商品详情图：`product-detail-default.jpg`
- 占位图：`placeholder.jpg`

## 技术栈
- 前端：
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Vue.js
  - Axios
  - Socket.io-client

- 后端：
  - Node.js
  - Express
  - MongoDB
  - Socket.io
  - JWT

## 主要功能
1. 用户系统
   - 注册/登录
   - 个人信息管理
   - 消息通知

2. 商品管理
   - 发布商品
   - 商品搜索
   - 分类浏览
   - 收藏功能

3. 交易系统
   - 在线聊天
   - 交易记录
   - 评价系统

4. 其他功能
   - 实时消息
   - 图片上传
   - 商品推荐

## 开发说明
1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
# 前端依赖
npm install

# 后端依赖
cd server
npm install
```

3. 运行项目
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm run start
```

## API 文档
API 文档请参考 `/docs/api.md`

## 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 发起 Pull Request

## 许可证
MIT License
