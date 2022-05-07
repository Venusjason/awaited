const cachedApiMap: Map<Symbol, { request: any; updateTime: number }> = new Map()

/** 清除系统接口缓存 */
export const clearAllMemoryService = () => {
  Array.from(cachedApiMap).forEach(([key]) => {
    cachedApiMap.delete(key)
  })
}

/**
 * 请求缓存 支持 自动重置 支持 缓存超时重置
 *
 * @param name
 * @param fn
 * @param cacheTime
 * @returns
 */
export default <T = any>(
  /** 真实请求第三方服务的函数体 */
  fn: () => Promise<T>,
  /** 缓存有效期 默认1min */
  cacheTime = 1 * 60 * 1000,

  /** 唯一键名, 可以直接用 Symbol */
  name: Symbol = Symbol(),
) => {
  let state = 'pending'

  const cachedFn = function (): Promise<T> {
    if (!cachedApiMap.get(name)) {
      const updateTime = new Date().getTime()
      state = 'pending'
      const request = fn()
      cachedApiMap.set(name, {
        request,
        updateTime,
      })
      request
        .then(() => {
          state = 'fulfilled'
        })
        .catch(() => {
          state = 'rejected'
        })
      return request
    } else {
      if (state === 'rejected') {
        // 上次请求出错，下次请求走重置
        return cachedFn.reset()
      }
      const updateTime = cachedApiMap.get(name)?.updateTime as number
      if (new Date().getTime() - updateTime >= cacheTime) {
        // 缓存过期
        return cachedFn.reset()
      }
      return cachedApiMap.get(name)?.request
    }
  }

  cachedFn.reset = function () {
    cachedApiMap.delete(name)
    return cachedFn()
  }

  return cachedFn
}
