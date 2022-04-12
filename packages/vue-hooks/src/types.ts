import { Ref } from 'vue';
export interface LoadMoreFormatReturn {
  list: any[];
  total?: number;
}

export interface LoadMoreOptionsWithFormat<R extends LoadMoreFormatReturn, RR> {
  formatResult?: (data: RR) => R;
  /** 容器的 ref，如果存在，则在滚动到底部时，自动触发 loadMore */
  ref?: Ref<any>;
  /** 判断是否还有更多数据的函数 */
  isNoMore?: (r: R | undefined) => boolean;
  /** 下拉自动加载，距离底部距离阈值 */
  threshold?: number;
}
