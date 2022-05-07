import { ref, onMounted, onUnmounted, Ref, watch, nextTick } from 'vue-demi'

import useRequest, { IOptions, UseRequestReturn } from './useRequest'

/** Service 返回值 */
export type ILoadMoreResponse<ListItem = any> = {
  list: ListItem[]
  total: number
  [key: string]: any
}

type UseLoadMoreReturn<ListItem = any> = Omit<
  UseRequestReturn<ILoadMoreResponse<ListItem>>,
  'run'
> & {
  /** 加载更多 */
  loadMore: UseRequestReturn<ILoadMoreResponse<ListItem>>['run']
  /** 是否有更多 */
  noMore: Ref<boolean>
  /** 重新加载 */
  reload: () => void
}

export type ILoadMoreOptions = IOptions & {
  /** 容器的 ref，如果存在，则在滚动到底部时，自动触发 loadMore */
  ref?: Ref<HTMLElement>
  /** 判断是否还有更多数据的函数 */
  isNoMore?: (r: ILoadMoreResponse | undefined) => boolean
  /** 下拉自动加载，距离底部距离阈值 */
  threshold?: number
}

/** 数据源获取 上次返回值作为下次请求的入参 */
export type ILoadMoreService<T> = (p: ILoadMoreResponse<T> | undefined) => ILoadMoreResponse<T>

export default <T>(
  service: ILoadMoreService<T>,
  options: ILoadMoreOptions = {},
): UseLoadMoreReturn<T> => {
  const { ref: containerRef, isNoMore, threshold = 50, refreshDeps, ...restOpts } = options

  const noMore = ref(false)

  let isReloadAction = true

  let dataGroup: ILoadMoreResponse
  const loadService = async () => {
    // 加载完成 不再运行service
    if (noMore.value) return Promise.reject('noMore')
    if (isReloadAction && containerRef) {
      containerRef.value?.scrollTo(0, 0)
    }
    try {
      dataGroup = await service(isReloadAction ? undefined : dataGroup)
      isReloadAction = false
      noMore.value = isNoMore ? isNoMore(dataGroup) : dataGroup.total <= dataGroup.list.length
      return Promise.resolve(dataGroup)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  const { run, loading, ...useRequestRest } = useRequest(loadService, {
    initialData: {
      list: [],
    },
    loadMore: true,
    ...restOpts,
  })

  const reload = async () => {
    isReloadAction = true
    noMore.value = false
    await run()
  }

  /* 上拉加载的方法 */
  const scrollMethod = () => {
    if (loading.value || !containerRef || !containerRef.value) {
      return
    }

    if (
      containerRef.value.scrollHeight - containerRef.value.scrollTop <=
      containerRef.value.clientHeight + threshold
    ) {
      run()
    }
  }

  onMounted(() => {
    containerRef?.value?.addEventListener('scroll', scrollMethod)
  })
  onUnmounted(() => {
    containerRef?.value?.removeEventListener('scroll', scrollMethod)
  })

  watch(refreshDeps || [], () => {
    if (!options.manual) reload()
  })

  return {
    loadMore: run,
    reload,
    noMore,
    loading,
    ...useRequestRest,
  }
}
