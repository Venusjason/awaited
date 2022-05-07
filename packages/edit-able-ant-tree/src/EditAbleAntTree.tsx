import React, { Key, useEffect, useMemo, useRef, useState } from 'react'
import { Input, message, Space, Tree, Popconfirm } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { editProperty, filterDataSource } from '@awaited/helper'

import './index.less'
import { TreeProps, DataNode, EventDataNode } from 'antd/lib/Tree'

export type EditDataNode = DataNode & {
  /** 节点是否可编辑, 默认不可编辑 */
  editable?: boolean
  /** 节点是否可编辑, 默认不可删除 */
  removeable?: boolean
  /** 节点是否可添加子节点, 默认不可添加 */
  addable?: boolean

  title: string
  parentKey?: string | number
  indexs?: number[]
}

export interface IProps extends TreeProps {
  /** 添加节点的提交 */
  addNode: (title: string, node: EditDataNode) => Promise<DataNode> | void
  /** 修改节点提交 */
  editNode: (title: string, node: DataNode) => Promise<DataNode | undefined> | void
  /** 删除节点提交 */
  removeNode: (node: DataNode) => Promise<any> | void
  /** 触发treedata 更新 */
  onTreeDataUpdate: (data: DataNode[]) => DataNode[]
}

let id = 0

const KEY_NAME = 'EDIT_TREE_NODE_'
const genUuid = () => KEY_NAME + id++
const isMyKey = (key: string) => typeof key === 'string' && key.startsWith(KEY_NAME)

export default (props: IProps) => {
  const { treeData, ...restProps } = props
  // const loadData = ({ key, title }: DataNode, newNode: DataNode) => {}
  const [expandKeys, setExpandKeys] = useState<Key[]>(props.expandedKeys || [])
  const [currentNode, setCurrentNode] = useState<string | number>('')
  const inputRef = useRef<any>()

  const handleEdit = (e: React.MouseEvent, node: DataNode) => {
    e.stopPropagation()
    setCurrentNode(node.key)
  }

  const handleSubmit = async (e: React.MouseEvent, node: EditDataNode) => {
    e.stopPropagation()
    const val = inputRef.current?.input?.value
    console.log(node)
    if (isMyKey(node.key as string)) {
      const newNode = await props.addNode(val, node)
      props.onTreeDataUpdate(
        editProperty(treeData, (item: DataNode) => {
          if (item.key === node.key) {
            Object.assign(item, newNode)
          }
          return item
        }),
      )
    } else {
      const newNode = await props.editNode(val, node)
      props.onTreeDataUpdate(
        editProperty(treeData, (item: DataNode) => {
          if (item.key === node.key) {
            Object.assign(
              item,
              newNode || {
                title: val,
              },
            )
          }
          return item
        }),
      )
    }
    setCurrentNode('')
  }

  const handleAdd = (e: React.MouseEvent, parentNode: EditDataNode) => {
    e.stopPropagation()
    const key = genUuid()
    props.onTreeDataUpdate(
      editProperty(treeData, (item: DataNode) => {
        if (item.key === parentNode.key) {
          if (!item.children) item.children = []
          item.children = [
            ...item.children,
            {
              title: '',
              key,
              // @ts-ignore
              parentKey: item.key,
            },
          ]
        }
        return item
      }),
    )
    // TODO: BUG expandKeys
    // console.log('expandKeys => ', expandKeys.join(';'))
    const set = new Set([...expandKeys, parentNode.key])

    setExpandKeys([...set])
    setCurrentNode(key)
  }

  const handleRemove = async (node: EditDataNode) => {
    // 判断是否是可删除节点
    await props.removeNode?.(node)
    props.onTreeDataUpdate(
      filterDataSource(treeData, (item: DataNode) => {
        return item.key !== node.key
      }),
    )
  }

  const handleCancel = ({ key }: EditDataNode) => {
    // 如果是新增节点，就直接删除掉
    if (isMyKey(key as string)) {
      props.onTreeDataUpdate(
        filterDataSource(treeData, (item: DataNode) => {
          return item.key !== key
        }),
      )
    }
    setCurrentNode('')
  }

  const treeNodes = useMemo(() => {
    return editProperty(treeData, (item: EditDataNode) => {
      return {
        ...item,
        editable: true,
        title: (
          <Space className="edit-able-ant-tree-nodetitle">
            {currentNode === item.key ? (
              // @ts-ignore
              <Input size="small" defaultValue={item.title} ref={inputRef} />
            ) : (
              <span>{item.title}</span>
            )}

            <Space
              className={`edit-able-ant-tree-nodetitle-btns ${
                currentNode !== '' && (currentNode === item.key ? 'editing-node' : 'noediting-node')
              } `}
              size={'middle'}
            >
              {currentNode === item.key ? (
                <>
                  <CloseOutlined onClick={() => handleCancel(item)} />
                  <CheckOutlined onClick={(e) => handleSubmit(e, item)} />
                </>
              ) : (
                <>
                  {item.editable && <EditOutlined onClick={(e) => handleEdit(e, item)} />}

                  {item.addable && <PlusOutlined onClick={(e) => handleAdd(e, item)} />}

                  {item.removeable && (
                    <Popconfirm
                      title="你确定要删除吗？"
                      onConfirm={() => handleRemove(item)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <MinusOutlined />
                    </Popconfirm>
                  )}
                </>
              )}
            </Space>
          </Space>
        ),
      }
    })
  }, [treeData, currentNode])

  return (
    <Tree
      {...restProps}
      showLine={true}
      showIcon={true}
      treeData={treeNodes}
      expandedKeys={expandKeys}
      onExpand={(expandedKeys: Key[], info) => {
        setExpandKeys(expandedKeys)
      }}
    />
  )
}
