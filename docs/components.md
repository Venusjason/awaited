---
title: 开发说明
order: 0
group:
  path: /
nav:
  title: 组件
  path: /components
---

# 说明

为了沉淀前端常用组件、模板、物料、类库等资产，使用 npm 封装 package 是常见的手段，为了规范组内成员代码规范、发布流程、版本协议等，我们使用了`lerna`作为包管理工具，并结合 [dumi](https://d.umijs.org/) 文档为开发者提供了`markdown`的组件 api 书写方式，而且可以实时预览你的组件

## 前置技能

- react / vue
- typescript
- [npm 包规范](https://zhuanlan.zhihu.com/p/212832506)

### 运行项目

```
lerna bootstrap
yarn start
```

然后文档服务就启动了

### 创建包

```
npm run gen:pkg [pkgName]
```

然后会自动帮你生成 `package.json`、`README.md`、`src/index.ts`文件，按照目录规范开发

### 调试包

[dumi](https://d.umijs.org/) 提供了完善的组件文档开发方案，直接在 md 内写 code 既可渲染

### 发布包

- 确保你的包导出文件为 `src/index.ts`
- 先发起 mr 到 master,并被合并至 master
- 只有 master 权限的才可发布

```
npm run release
```

lerna 会自动让你选择你要发布的 package 和 最新版本号

### 发布文档

```
npm run site
```

待开发组件

| 组件名     | 描述      | 开发者       | 排期 | 进度 |
| ---------- | --------- | ------------ | ---- | ---- |
| 上传组件   | 基于 antd | 李宇、亢恩行 | -    | -    |
| 水波纹组件 | 基于 antd | 亢恩行       | -    | -    |
| 地图组件   | 基于 antd | 宋涛         | -    | -    |

### TODO

- [x] gitee 自动化部署 pages
