import { cloneDeep } from 'lodash-es'
/** 递归 过滤数组符合的匹配项 */
function filterDataSource<T>(
  dataSource: T[],
  filterFn: (item: T, index: number) => boolean,
  // 子节点属性值
  childrenKey: string = 'children',
  // 层级
  indexs: number[] = [],
) {
  return cloneDeep(dataSource).filter((item, i) => {
    const b = filterFn(item, i)
    if (Array.isArray(item[childrenKey]) && b) {
      item[childrenKey] = filterDataSource(item[childrenKey], filterFn, childrenKey, [...indexs, i])
    }
    return b
  })
}

export default filterDataSource
