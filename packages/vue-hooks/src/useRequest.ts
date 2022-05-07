import { ref, Ref, watch, onUnmounted, WatchSource } from 'vue-demi'

import { throttle, debounce } from 'lodash-es'

class PromiseWithAbort {
  constructor(fn: any) {
    let _abort = null
    let _p = new Promise((res, rej) => {
      fn.call(null, res, rej)
      _abort = function (error = 'prev promise is aborted') {
        rej(error)
      }
    })
    // @ts-ignore
    _p.abort = _abort
    return _p
  }
}

export interface IOptions {
  /** 手动调用 */
  manual?: boolean
  /** 自动过滤service中无效入参 */
  filterServiceInvalidValue?: boolean
  /** Data 默认值 */
  initialData?: any
  /** 默认错误返回 */
  defaultError?: string
  /** 防抖间隔, 单位为毫秒，设置后，请求进入防抖模式 */
  debounceInterval?: number
  /** 节流间隔, 单位为毫秒，设置后，请求进入节流模式。 */
  throttleInterval?: number
  /**
   * 在 manual = false 时，refreshDeps 变化，会触发 service 重新执行 分页模式下， refreshDeps 变化，会重置 currentPage
   * 到第一页，并重新发起请求，一般你可以把依赖的条件放这里。
   */
  refreshDeps?: WatchSource
  /** 缓存键 要求必须唯一， 建议用symbol，paginated loadMore 模式下无效 函数service入参变化，缓存也会失效 */
  cacheKey?: any
  /** 设置缓存数据回收时间。默认缓存数据 5 分钟后回收 如果设置为 -1, 则表示缓存数据永不过期 需要配和 cacheKey 使用 */
  cacheTime?: number

  /** 内部调用，请勿使用 */
  loadMore?: boolean
  /** 内部调用，请勿使用 */
  paginated?: boolean
}

export type IService<T> = (...args: any[]) => Promise<T>

export type UseRequestReturn<T> = {
  run: IService<T>
  /** 缓存强制重置 */
  reset: IService<T>
  data: Ref<T>
  error: Ref<unknown>
  loading: Ref<boolean>
}

const GLOBAL_OPTION = {
  manual: false,
  filterServiceInvalidValue: true,
  debounceInterval: 0,
  throttleInterval: 0,
}

export const cacheServices: Map<
  any,
  {
    // 上次请求时间戳
    timestamp: number | null
    // 上次请求参数
    request: any
    // 缓存请求结果
    response: any

    p?: Promise<any> | null

    runs: Map<Symbol, any>
  }
> = new Map()

/**
 * 设置全局 request option
 *
 * @param option
 */
export const setGlobalRequestOption = (option: Partial<typeof GLOBAL_OPTION>) => {
  Object.assign(GLOBAL_OPTION, option)
}

/**
 * 返回数据类型
 *
 * @param data 数据
 * @returns 数据类型 小写
 */
export const getType = (data: any): string => {
  const val = Object.prototype.toString.call(data)
  // @ts-ignore
  return val.match(/\[object (.*?)\]/)[1].toLowerCase()
}

/**
 * 去除无效值
 *
 * @param data
 * @returns
 */
export const filterInvalidValue = (data: any) => {
  if (getType(data) === 'object') {
    let obj = {}
    Object.keys(data).forEach((key) => {
      if ([null, undefined, ''].includes(data[key])) return
      if (typeof data[key] === 'object') {
        obj[key] = filterInvalidValue(data[key])
      } else {
        obj[key] = data[key]
      }
    })
    return obj
  } else if (getType(data) === 'array') {
    return data.map((item: any) => filterInvalidValue(item))
  }
  return data
}

export default <T>(service: IService<T>, options?: IOptions): UseRequestReturn<T> => {
  const uuid = Symbol('CACHE_KEY_UUID')

  options = Object.assign({}, GLOBAL_OPTION, options)

  const { cacheKey, cacheTime = 5 * 60 * 1000 } = options

  const loading = ref(false)

  const data = ref<any>(options?.initialData || null)
  const error = ref<any>(undefined)

  const isCacheMode = !(options.paginated || options.loadMore || cacheKey === undefined)

  if (isCacheMode) {
    cacheServices.set(cacheKey, {
      timestamp: null,
      request: null,
      response: null,
      p: null,
      runs: new Map(),
    })
  }

  // 缓存请求
  const serviceCacheFn = async (...args: any[]): Promise<T> => {
    if (!isCacheMode || !cacheKey || !cacheServices.get(cacheKey)) return service(...args)
    let currentT = new Date().getTime()
    if (
      typeof cacheServices.get(cacheKey) !== 'undefined' &&
      !cacheServices.get(cacheKey)?.timestamp
    ) {
      const a = cacheServices.get(cacheKey)
      const dataBase = a as Exclude<typeof a, undefined>
      dataBase.timestamp = currentT
      dataBase.timestamp = currentT
      dataBase.p = Promise.resolve().then(() => service(...args))
    }
    if (!cacheServices.get(cacheKey)?.runs.get(uuid)) {
      cacheServices.get(cacheKey)?.runs.set(uuid, { data })
    }

    try {
      const response = await cacheServices.get(cacheKey)?.p
      // @ts-ignore
      cacheServices.set(cacheKey, {
        ...cacheServices.get(cacheKey),
        request: [...args],
        response,
      })
    } catch (e) {
      return Promise.reject(e)
    }

    const a = cacheServices.get(cacheKey)
    const { timestamp, response } = a as Exclude<typeof a, undefined>

    // 超时 或 入参变更 ，删除缓存 重新请求
    if (currentT - (timestamp || 0) > cacheTime && cacheTime > 0) {
      // @ts-ignore
      cacheServices.get(cacheKey).timestamp = null
      // @ts-ignore
      cacheServices.get(cacheKey).response = null
      return serviceCacheFn(...args)
    }

    // @ts-ignore
    Array.from(cacheServices.get(cacheKey).runs).forEach(([currentUuid, dataRef]) => {
      if (uuid !== currentUuid) {
        dataRef.data.value = response
      }
    })

    return Promise.resolve(response)
  }

  // 重置缓存
  const reset = () => {
    if (isCacheMode) {
      // @ts-ignore
      cacheServices.get(cacheKey).timestamp = null
      // @ts-ignore
      cacheServices.get(cacheKey).response = null
    }
    return run()
  }

  const fn = (...args: any[]) =>
    new PromiseWithAbort((resolve: any, reject: any) => {
      serviceCacheFn(...args)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })

  let prevService: any

  let run = async (...args: unknown[]) => {
    if (loading.value) {
      // 丢弃上次请求结果
      prevService?.abort?.()
    }

    const ev = args?.[0] as any
    // 去除event默认行为
    if (ev?.stopPropagation) {
      args = args.slice(0, args.length - 1)
    }

    args = args.map((arg) => {
      if (options?.filterServiceInvalidValue) {
        return filterInvalidValue(arg)
      }
      return arg
    })

    loading.value = true
    prevService = fn(...args)
    try {
      // @ts-ignore
      const res = await prevService
      loading.value = false
      data.value = res
      return Promise.resolve(res)
    } catch (e) {
      error.value = e || options?.defaultError
      loading.value = false
      return Promise.reject(e || options?.defaultError)
    }
  }

  if (options.debounceInterval) {
    // @ts-ignore
    run = debounce(run, options.debounceInterval)
  }

  if (options.throttleInterval) {
    // @ts-ignore
    run = throttle(run, options.throttleInterval)
  }

  watch(
    options.refreshDeps || [],
    () => {
      if (!options?.manual) {
        run()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (isCacheMode) {
      // 防止内存泄露
      cacheServices.get(cacheKey)?.runs.delete(uuid)
    }
  })

  return {
    run,
    reset,
    data,
    error,
    loading,
  }
}
