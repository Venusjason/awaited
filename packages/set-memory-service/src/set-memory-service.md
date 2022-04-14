---
title: set-memory-service
group:
  path: /set-memory-service
nav:
  title: 组件
  path: /components
---

# `@awaited/set-memory-service`

### 需求背景：

项目中需要一个省市区的级联选择器，考虑到国内省市区更新并不频繁，前端有如下方案

- a. 省市区数据源 写到本地 js 文件内
- b. 请求后端接口实时去查询 ​

a 方案：看着还不错，但是在**小程序平台对代码体积有限制**，省市区数据量可以直接占用 300 多 kb，还是太大了，比如今年杭州区划调整，那我们还需要小程序重新发版，不太好 b 方案：不需要前端重新发版，但是数据量太大，每次请求时长近 200ms，**前端对这个请求时长不太满意，后端也觉得频繁请求该接口，徒增服务器压力** 那有没有一个方案，既能相对准确更新省市区数据，又能对服务器压力降到最低，那就是对 b 方案的改良

- **减少请求频次**，前端可以认为在某一期限内（1 小时）数据是不更新的，实际上后端数据库维护省市区也不是实时更新的

### 定义

我们把这类需求总结一下：**对一个预期结果进行前端缓存，在一个周期内不需要真实查询，可以直接使用上一次查询到的结果作为返回值**

---

讲到这里，肯定有人会有以下方案

```javascript
// 全局定义
let data;

async function getData() {
  const res = await fetch();
  data = res;
}

// 调用层
if (!data) {
  await getData();
}
// 再去使用data
```

讲讲弊端

- 调用层充斥对 data 值得判断，代码质量无法控制，对业务开发者来说不能达到无感调用
- 没有一个友好的刷新机制
- 全局定义的变量 不太符合开放封闭原则，极容易被其他开发者改写，毕竟都 2022 年了，js 模块化都没有是不行的

​

### 期望中的调用模式

```javascript
getMemoryData().then((res) => {
  // res 可能是缓存中的值，也可能是直接向后端请求来的
});
```

- 调用层并不关注 值从后端接口获取还是前端缓存中读取，但这必然是个异步回调
- 封装层：初始获取数据 或数据存储时效过期 要从 后端请求，保证数据的 fresh
- 封装层： 在有效期内，数据不需要重新请求，可直接返给调用层
- 封装层：要考虑数据请求失败，失败的结果不需要缓存，下次调用时要重新请求
- 封装层：可以由调用层 手动强制数据刷新来保证数据的 fresh

### 怎么使用

```typescript
import setMemoryService, { clearAllMemoryService } from '@awaited/set-memory-service';

// 请求后端省市区的接口
const getAddrs = () => {
  const data = [
    {
      label: '浙江省',
      value: '浙江省',
      children: [
        {
          label: '杭州市',
          value: '杭州市',
          children: [
            {
              label: '西湖区',
              value: '西湖区',
            },
            {
              label: '余杭区',
              value: '余杭区',
            },
          ],
        },
      ],
    },
  ];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
};

const getMemoryAddrs = setMemoryService(
  getAddrs,
  1 * 60 * 60 * 1000, // 数据1h 内可不刷新
  Symbol('getAddrs'), // 可不传
);

getMemoryAddrs().then((res) => {
  // 可能是缓存的结果，但是调用层并没有感知
});
// 强制刷新省市区数据
getMemoryAddrs.reset();
```

这样业务开发人员可以在系统中任意逻辑页面中 无脑调用 `getMemoryAddrs()` ，当用户的页面第一次请求到数据后，切换到其他页面可以迅速获取上一次获取到的数据，对开发者来说封装足够简洁，灵活些强、侵入性低
