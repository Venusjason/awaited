import { cloneDeep } from 'lodash-es'
/**
 * 递归 修改、增加 item 属性
 */
function editProperty<T, P = T>(
  dataSource: T[],
  /** 添加属性的方法 */
  editFn: (item: T, i: number, indexs: number[]) => P,
  childrenKey: string = 'children',
  indexs: number[] = [],
): P[] {
  return cloneDeep(dataSource).map((item, i) => {
    const newItem = editFn(item, i, [...indexs, i])
    if (Array.isArray(newItem[childrenKey]) && newItem[childrenKey].length > 0) {
      newItem[childrenKey] = editProperty(
        item[childrenKey],
        editFn,
        childrenKey,
        [...indexs, i],
      )
    }
    return newItem
  })
}

export default editProperty