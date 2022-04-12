export default class XStorage<T extends object> {
  private storage: Storage;

  private nameSpace: string = 'NAMESPACE';

  private state = {} as T;

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
    } else if (typeof data === 'object' && data !== null) {
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
      // @ts-ignore
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
    // @ts-ignore
    this.state[key] = value;
    this.storage.setItem(this.nameSpace, JSON.stringify(this.state));
  }

  /**
   * 获取缓存值
   *
   * @param key
   */
  public getItem<K extends keyof T>(key: K): T[K] {
    // @ts-ignore
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
      // @ts-ignore
      this.resetItem(item);
    });
  }
}
