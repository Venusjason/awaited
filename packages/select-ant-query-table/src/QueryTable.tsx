import {Button, Card, Modal, ModalProps, Table, Tag} from 'antd'
import { useAntdTable } from 'ahooks'
import { Service, Data, Params } from 'ahooks/lib/useAntdTable/types'
import { ColumnGroupType, ColumnType, TableProps } from 'antd/lib/table';
import React, { ReactComponentElement, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

export interface TriggerComponentProps<T> {
  value: T[],
  rowKeyValue: string | number[],
  // 删除
  remove: (id: string, index: number) => void;
  onClick: () => void,
}

export interface SelectAntQueryTableProps<
  T,
  TData,
  TParams,
> {
  value: string | number[],
  onChange: (v: string | number[]) => void,
  /**
   * 单选 or 多选
   * 默认 checkbox
   */
  mode?: 'checkbox' | 'radio',
  onValueChange?: (v: T[]) => void,
  /**
   * 触发按钮自定义
   */
  TriggerComponent?: (props: TriggerComponentProps<T>) => ReactNode,
  service: Service<TData, TParams>,
  /**
   * 根据id反查数据
   */
  getItemsService: (v: any[]) => Promise<T[]>,
  /**
   * 同 ant table columns
   */
  columns: (ColumnGroupType<T> | ColumnType<T>)[],
  /**
   * 同 ant table tableProps
   */
  tableProps?: TableProps<T>,
  /**
   * 同 ant modal props
   */
  modalProps?: ModalProps,
  /**
   * 表单上的查询项
   */
  children?: (run: any) => ReactNode,
  /**
   * 同 ant pagination props
   */
  paginationProps?: any,
}

export default <
  T extends object,
  TData extends Data = Data,
  TParams extends Params = Params,
>(props: SelectAntQueryTableProps<T, TData, TParams>) => {
  const {TriggerComponent, mode = 'checkbox'} = props
  const paginationProps = props.paginationProps || {
    size: 'small',
    showSizeChanger: false,
  }

  const uuidKey = (props.tableProps?.rowKey || 'id') as string

  const {data, run, runAsync, refresh, loading, tableProps} = useAntdTable(props.service, {
    manual: false,
    defaultPageSize: 10,
  })

  const tablePropsResults = {
    ...tableProps, ...(props.tableProps || {}),
  }

  const [cacheList, setCacheList] = useState<T[]>([])

  useEffect(() => {
    const cacheListIds = cacheList.map(ele => ele[uuidKey])
    const cList = data?.list.filter(ele => !cacheListIds.includes(ele[uuidKey])) ||[]
    setCacheList((cacheList) => cacheList.concat(cList))

    const keys = cacheList.map(ele => ele[uuidKey])
    const needResearchKeys = props.value.filter((ele) => {
      return !keys.includes(ele[uuidKey])
    })
    if (needResearchKeys.length === 0) return
    props?.getItemsService?.(needResearchKeys).then((arr) => {
      setCacheList(cacheList => cacheList.concat(arr))
    })

  }, [data, props.tableProps?.rowKey, props.value])

  const list2 = useMemo(() => {
    return props.value.map(val => {
      return cacheList.find(item => item[uuidKey] === val) || {[uuidKey]: val}
    })
  }, [props.value, cacheList])

  useEffect(() => {
    props.onValueChange?.(list2)
  }, [list2])

  // 用户手动选择/取消选择某行的回调
  function onSelect (record: T, selected: boolean, selectedRows) {
    console.log('onSelect', record, selected, selectedRows);
    const val = record[uuidKey]
    if (selected && mode === 'checkbox') {
      const set  = new Set([...props.value, val])
      props.onChange([...set])
    } else if (selected && mode === 'radio'){
      props.onChange([val])
    }else {
      const b = props.value.filter(ele => ele !== val)
      props.onChange(b)
    }
  }

  // 用户手动选择/取消选择所有行的回调
  function onSelectAll (selected: boolean, selectedRows, changeRows: T[]) {
    // console.log('onSelectAll', selected, selectedRows, changeRows);
    const changeRowsVal = changeRows.map(ele => ele[uuidKey])
    if (selected) {
      const set  = new Set([...props.value, ...changeRowsVal])
      props.onChange([...set])
    } else {
      const val = props.value.filter(item => !changeRowsVal.includes(item))
      props.onChange(val)
    }

  }

  async function table2Service ({current, pageSize}: {
    current: number,
    pageSize: number,
  }) {
    const list = list2.filter((_, i) => (
      (current - 1) * pageSize <= i &&
      current * pageSize > i
    ))
    return {
      total: list2.length,
      list,
      current,
      pageSize,
    }
  }

  const {tableProps: tableProps2} = useAntdTable(table2Service, {
    defaultPageSize: 10,
  })

  const p2 = {
    ...props.tableProps, ...tableProps2,
  }

  const [visible, setVisible] = useState(false)
  function handleClick() {
    run(undefined, ...arguments)
  }

  const onRemove = (id: string | number) => {
    const v = props.value.filter(item => item !== id) || []    
    props.onChange(
      v
    )
  }

  return <div>
    <div>
    {/* {
      props.triggerButton || <Button type='primary' size='small'>{props.value.length > 0 ? `已选择${props.value.length}个` : '点击选择'}</Button>
    } */}
    {
      TriggerComponent ? <TriggerComponent value={list2} remove={onRemove} onClick={() => setVisible(true)} rowKeyValue={props.value}/> : <Button type='primary' size='small'>{props.value.length > 0 ? `已选择${props.value.length}个` : '点击选择'}</Button>
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
    <div>
      {
        props.children?.(handleClick)
      }
    </div>
    <div className="awaited-select-tables">
      <div className='awaited-select-tables-item'>
        <Card title="请选择">
          <Table 
            {...tablePropsResults}
            pagination={{
              ...tablePropsResults.pagination,
              ...paginationProps,
            }}
            columns={props.columns}
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
          <Table
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
  </div>;
};
