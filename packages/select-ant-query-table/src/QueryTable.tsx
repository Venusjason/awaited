import { Button, Card, Modal, ModalProps, Table, Tag } from 'antd'
import { useAntdTable } from 'ahooks'
import { Service, Data, Params } from 'ahooks/lib/useAntdTable/types'
import { ColumnGroupType, ColumnType, TableProps } from 'antd/lib/table'
import React, {
  ReactComponentElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { SelectionSelectFn } from 'antd/lib/table/interface'
import './index.less'

export interface TriggerComponentProps<T = any> {
  value: T[]
  rowKeyValue: (string | number)[]
  // 删除
  remove: (id: string | number, index: number) => void
  onClick: () => void
}

export interface SelectAntQueryTableProps<
  T extends Record<string, any>,
  TData extends Data,
  TParams extends Params,
> {
  value: (string | number)[]
  onChange: (v: (string | number)[]) => void
  /** 单选 or 多选 默认 checkbox */
  mode?: 'checkbox' | 'radio'
  onValueChange?: (v: T[]) => void
  /** 触发按钮自定义 */
  TriggerComponent?: (props: TriggerComponentProps<T>) => ReactNode
  service: Service<TData, TParams>
  /** 根据id反查数据 一般用于数据回显使用 */
  getItemsService: (v: (string | number)[]) => Promise<T[]>
  /** 同 ant table columns */
  columns: (ColumnGroupType<T> | ColumnType<T>)[]
  /** 同 ant table tableProps https://ant.design/components/table-cn/#API */
  tableProps?: TableProps<T>
  /** 同 ant modal props https://ant.design/components/modal-cn/#API */
  modalProps?: ModalProps
  /** 表单上的查询项 formValue 作为 service 的第二个参数传入 */
  children?: (run: (formValue: object) => void) => ReactNode
  /** 同 ant pagination props https://ant.design/components/pagination-cn/#API */
  paginationProps?: any
}

export default <
  T extends Record<string, any>,
  TData extends Data = Data,
  TParams extends Params = Params,
>(
  props: SelectAntQueryTableProps<T, TData, TParams>,
) => {
  const { TriggerComponent, mode = 'checkbox' } = props
  const paginationProps = props.paginationProps || {
    size: 'small',
    showSizeChanger: false,
  }

  const uuidKey = (props.tableProps?.rowKey || 'id') as string

  const { data, run, runAsync, refresh, loading, tableProps } = useAntdTable(props.service, {
    manual: false,
    defaultPageSize: 10,
  })

  const tablePropsResults = {
    ...tableProps,
    ...(props.tableProps || {}),
  }

  const [cacheList, setCacheList] = useState<T[]>([])

  useEffect(() => {
    const cacheListIds = cacheList.map((ele) => ele[uuidKey])
    const cList = data?.list.filter((ele) => !cacheListIds.includes(ele[uuidKey])) || []
    setCacheList((cacheList) => cacheList.concat(cList))

    const keys = cacheList.map((ele) => ele[uuidKey])
    const needResearchKeys = props.value.filter((ele) => {
      return !keys.includes(ele[uuidKey])
    })
    if (needResearchKeys.length === 0) return
    props?.getItemsService?.(needResearchKeys).then((arr) => {
      setCacheList((cacheList) => cacheList.concat(arr))
    })
  }, [data, props.tableProps?.rowKey, props.value])

  const list2 = useMemo(() => {
    return props.value.map((val) => {
      return cacheList.find((item) => item[uuidKey] === val) || { [uuidKey]: val }
    })
  }, [props.value, cacheList])

  useEffect(() => {
    props.onValueChange?.(list2 as T[])
  }, [list2])

  // 用户手动选择/取消选择某行的回调
  const onSelect: SelectionSelectFn<T> = (record, selected, selectedRows) => {
    const val = record[uuidKey]
    if (selected && mode === 'checkbox') {
      const set = new Set([...props.value, val])
      props.onChange([...set])
    } else if (selected && mode === 'radio') {
      props.onChange([val])
    } else {
      const b = props.value.filter((ele) => ele !== val)
      props.onChange(b)
    }
  }

  // 用户手动选择/取消选择所有行的回调
  function onSelectAll(selected: boolean, selectedRows: T[], changeRows: T[]) {
    const changeRowsVal = changeRows.map((ele) => ele[uuidKey])
    if (selected) {
      const set = new Set([...props.value, ...changeRowsVal])
      props.onChange([...set])
    } else {
      const val = props.value.filter((item) => !changeRowsVal.includes(item))
      props.onChange(val)
    }
  }

  async function table2Service({ current, pageSize }: { current: number; pageSize: number }) {
    const list = list2.filter((_, i) => (current - 1) * pageSize <= i && current * pageSize > i)
    return {
      total: list2.length,
      list,
      current,
      pageSize,
    }
  }

  const { tableProps: tableProps2 } = useAntdTable(table2Service, {
    defaultPageSize: 10,
  })

  const p2 = {
    ...props.tableProps,
    ...tableProps2,
  }

  const [visible, setVisible] = useState(false)
  function handleClick() {
    // @ts-ignore
    run(undefined, ...arguments)
  }

  const onRemove = (id: string | number) => {
    const v = props.value.filter((item) => item !== id) || []
    props.onChange(v)
  }

  return (
    <div>
      <div>
        {/* {
      props.triggerButton || <Button type='primary' size='small'>{props.value.length > 0 ? `已选择${props.value.length}个` : '点击选择'}</Button>
    } */}

        {
          // @ts-ignore
          TriggerComponent ? (
            TriggerComponent?.({
              value: list2 as T[],
              remove: onRemove,
              onClick: () => setVisible(true),
              rowKeyValue: props.value,
            })
          ) : (
            <Button type="primary" size="small">
              {props.value.length > 0 ? `已选择${props.value.length}个` : '点击选择'}
            </Button>
          )
        }
      </div>

      <Modal
        title="请选择"
        footer={null}
        visible={visible}
        onCancel={() => setVisible(false)}
        width={800}
        {...(props.modalProps || {})}
      >
        <div>{props.children?.(handleClick)}</div>
        <div className="awaited-select-tables">
          <div className="awaited-select-tables-item">
            <Card title="请选择">
              <Table
                {...tablePropsResults}
                pagination={{
                  ...tablePropsResults.pagination,
                  ...paginationProps,
                }}
                columns={props.columns || []}
                rowSelection={{
                  type: mode,
                  selectedRowKeys: props.value,
                  onSelect,
                  onSelectAll,
                }}
              />
            </Card>
          </div>
          <div className="awaited-select-tables-item">
            <Card title="已选择">
              <Table<any>
                {...p2}
                pagination={{
                  ...p2.pagination,
                  ...paginationProps,
                }}
                dataSource={list2}
                columns={props.columns}
              />
            </Card>
          </div>
        </div>
      </Modal>
    </div>
  )
}
