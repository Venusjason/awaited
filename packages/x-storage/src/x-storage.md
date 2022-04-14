---
title: x-storage
group:
  path: /x-storage
nav:
  title: 组件
  path: /components
---

# `@awaited/x-storage`

### 为什么要写这个库？

- 前端页面依赖持久化存储 api 来保留数据状态，以便于用户在刷新、后退、关闭浏览器等操作能继续保留上一次访问状态
- 浏览器提供了 localstorge、sessionStorge、cookie、indexDB 等常用的数据存储方案，但是在项目协作中直接操作此类 api 会存在如下问题
  - **类型定义不清晰**：只能存储字符串类型数据，如 Number 0 与 String 0 ，存储进去都是 string0，做 boolean 运算会有不同的结果
  - **值存取不便捷**：如需要存 数组 `[1,2,3]`,需要`JSON.stringify([1,2,3])`,取出时还要在`JSON.parse()`
  - **没有统一数据管理，会导致缓存中存在多个重复属性**：如 A 同学定义一个键名为 `token` 的字段，B 同学又定义了一个 `x-token`的字段，实际两个字段存储值意义相同，不便于协作

所以我们要解决如上问题，要求 TS 类型完善 ​

### api 设计

| api       | 参数                 | 说明                                            |     |
| --------- | -------------------- | ----------------------------------------------- | --- |
| setItem   | (key, value) => void | 类似 localstorage.setItem, 可以支持常见对象存储 |
| getItem   | (key) => value       | 类似 localstorage.getItem                       |     |
| resetItem | (key) => void        | 恢复某个属性初始值                              |     |
| resetAll  | () => void           | 恢复所有属性初始值                              |     |

​

### 库的具体实现

​

```ts
export default class XStorage<T extends object> {
  private storage: Storage;

  private nameSpace: string = 'NAMESPACE';

  private state: T = {};

  private isProd = process.env.NODE_ENV === 'production';

  length = 0;

  /** 数据初始化存入值，方便使用resetItem */
  private _initalValue: T;

  private easyClone(data: object) {
    return JSON.parse(JSON.stringify(data));
  }

  constructor(
    state: T,
    /** 命名空间，定义之后不能再修改 */
    nameSpace: string = '',
    storage: Storage = window.localStorage,
  ) {
    if (!this.isProd) {
      // 递归校验属性 必须是值类型(不能为undefined) 或 null
      this.validateValue(state);
    }
    this.nameSpace = 'X_STROGE_' + nameSpace;
    this._initalValue = this.easyClone(state);
    this.storage = storage;

    this.init();
  }

  /**
   * 校验数据格式
   *
   * @param data
   * @returns
   */
  private validateValue(data: unknown) {
    const dataType = typeof data;
    if (['symbol', 'function', 'bigint', 'undefined'].includes(dataType)) {
      console.error(`XStorage不支持 ${dataType} 格式`, data);
    } else if (dataType === 'object' && data !== null) {
      // 递归校验
      for (let key in data) {
        this.validateValue(data[key]);
      }
    }
  }

  /** 初始值合并策略 - 缓存中已存在属性 提取出来赋值给state - 缓存中不存在属性 使用 state 同步给缓存(一般在产品迭代中出现新设置属性会出现) */
  private init() {
    const keys = Object.keys(this._initalValue);
    this.length = keys.length;
    let localStateStr = this.storage.getItem(this.nameSpace) || '{}';
    let localState = JSON.parse(localStateStr) || {};
    keys.forEach((key) => {
      this.setItem(key, localState[key] !== undefined ? localState[key] : this._initalValue[key]);
    });
  }

  /**
   * @param key 缓存key
   * @param value 缓存值
   */
  public setItem<K extends keyof T>(key: K, value: T[K]) {
    if (!this.isProd) {
      this.validateValue(value);
    }
    this.state[key] = value;
    this.storage.setItem(this.nameSpace, JSON.stringify(this.state));
  }

  /**
   * 获取缓存值
   *
   * @param key
   */
  public getItem<K extends keyof T>(key: K): T[K] {
    const value = this.state[key];
    if (value === undefined) {
      console.error(`XStorage: 构造函数中没有初始化${key}字段`);
    }
    return value;
  }

  // 恢复初始值
  public resetItem(key: keyof T) {
    this.setItem(key, this._initalValue[key]);
  }

  public resetAll() {
    // this.setItem(key, this._initalValue[key])
    Object.keys(this.state).forEach((item) => {
      this.resetItem(item);
    });
  }
}
```

​

​

### HOW to use?

```typescript
import XStorage from '@awaited/x-storage';

// 项目中所有缓存 可以在这里先声明
const defaultLocalStorage = {
  token: 'xxxx',
  userAuth: ['ADMIN', 'MANGER'],
  userInfo: {
    name: '',
    age: null,
  },
};

const defaultSessionStorage = {
  prevList: [{ productName: '新疆和田玉', price: 19222, uuid: '1' }],
};

export const xLocalStorage = new XStorage<typeof defaultLocalStorage>(
  defaultLocalStorage,
  'MY_LOCAL_STATE',
  localStorage,
);

export const xSessionStorage = new XStorage<typeof defaultSessionStorage>(
  defaultSessionStorage,
  'MY_SESSION_STATE',
  sessionStorage,
);
```

#### 让我们看一下关于 ts 使用时的类型提示

![image.png](https://cdn.nlark.com/yuque/0/2022/png/247808/1642579729175-b9940f78-4d8d-4c1e-b371-2caff410ac1f.png#clientId=uc945c988-df7e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=162&id=u5d24444d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=324&originWidth=1482&originalType=binary&ratio=1&rotation=0&showTitle=false&size=295074&status=done&style=none&taskId=u027da68a-962d-4c2f-9642-5ccba977a1f&title=&width=741) 键名是有类型校验的 ![image.png](https://cdn.nlark.com/yuque/0/2022/png/247808/1642579802750-d4d3002c-0c55-4bd1-891c-b2e47038703d.png#clientId=uc945c988-df7e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=188&id=u35497924&margin=%5Bobject%20Object%5D&name=image.png&originHeight=376&originWidth=1686&originalType=binary&ratio=1&rotation=0&showTitle=false&size=221661&status=done&style=none&taskId=udeae3e97-951f-4c3a-963f-8c63690d453&title=&width=843) token 的键值也是有 string 的校验提示

#### 让我们刷新看一下缓存结果是不是有效

![image.png](https://cdn.nlark.com/yuque/0/2022/png/247808/1642579978883-9b4b52a3-cf70-4728-8e05-f10d2a4a708f.png#clientId=uc945c988-df7e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=148&id=uf1b2546e&margin=%5Bobject%20Object%5D&name=image.png&originHeight=296&originWidth=480&originalType=binary&ratio=1&rotation=0&showTitle=false&size=37433&status=done&style=none&taskId=u9d31d525-9cb4-4fd5-88db-fa82877f97d&title=&width=240) 点击后 ![image.png](https://cdn.nlark.com/yuque/0/2022/png/247808/1642580005049-a27810ff-e9ef-4be6-a2a9-f62be976c2ee.png#clientId=uc945c988-df7e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=133&id=u6789ddf8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=266&originWidth=484&originalType=binary&ratio=1&rotation=0&showTitle=false&size=35834&status=done&style=none&taskId=u4d40827d-0fe5-4a17-aea5-d4acaa12b6f&title=&width=242) 刷新一下 ![image.png](https://cdn.nlark.com/yuque/0/2022/png/247808/1642580026180-7254cd74-8581-4afe-a436-e5e5bedfbf1a.png#clientId=uc945c988-df7e-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=137&id=u41f1d2f6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=274&originWidth=512&originalType=binary&ratio=1&rotation=0&showTitle=false&size=37995&status=done&style=none&taskId=u67f2ef44-1415-4eb6-a4cd-6132fdc668c&title=&width=256)

[代码地址](https://codesandbox.io/s/throbbing-waterfall-52fre?file=/src/views/Home.tsx) ​

​
