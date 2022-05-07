---
title: edit-able-ant-tree
group:
  path: /edit-able-ant-tree
nav:
  title: 组件
  path: /components
---

# `@awaited/edit-able-ant-tree`

### 组件背景

- ant Tree 仅仅支持 tree 形结构数据展示,不支持数据编辑

### 组件功能

- tree 数据展示
- tree 节点数据新增
- tree 节点数据修改

### 组件实现

- 第一个节点必须为 root 节点
- 操作为添加该节点的子节点
- 操作为删除当前节点
- 非叶子节点 hover 显示 edit & + & - icon
- isLeaf 叶子节点 hover 显示 edit & - icon
- 对号为提交， x 为还原数据
- title 数据源必须为 string，因为要支持编辑

### 作者

## Install

Using npm:

```bash
$ npm install --save @awaited/edit-able-ant-tree
```

or using yarn:

```bash
$ yarn add @awaited/edit-able-ant-tree
```

### 使用示例

```tsx
import React, { useState, useMemo } from 'react'
import { TreeProps, DataNode, EventDataNode } from 'antd/lib/Tree'
import EditAbleAntTree, { EditDataNode } from '@awaited/edit-able-ant-tree'
import { editProperty, sleep } from '@awaited/helper'

const initTreeData: DataNode[] = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        children: [
          { title: 'leaf', key: '0-0-0-0' },
          {
            title:
              'multiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line titlemultiple line title',
            key: '0-0-0-1',
          },
          { title: 'leaf', key: '0-0-0-2' },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ title: 'leaf', key: '0-0-1-0' }],
      },
      {
        title: 'parent 1-2',
        key: '0-0-2',
        children: [
          { title: 'leaf', key: '0-0-2-0' },
          {
            title: 'leaf',
            key: '0-0-2-1',
          },
        ],
      },
    ],
  },
  {
    title: 'parent 2',
    key: '0-1',
    children: [
      {
        title: 'parent 2-0',
        key: '0-1-0',
        children: [
          { title: 'leaf', key: '0-1-0-0' },
          { title: 'leaf', key: '0-1-0-1' },
        ],
      },
    ],
  },
]
let id = 0
export default () => {
  const [treeData, setTreeData] = useState(initTreeData)

  const editNode = async (title: string, node: DataNode) => {
    // 提交到服务端做数据更新
  }

  const addNode = async (title: string, node: EditDataNode) => {
    const { parentKey } = node
    await sleep(parentKey)
    id++
    return {
      key: id,
      title,
    }
  }

  const removeNode = async (node) => {
    // 模拟接口删除
    await sleep(node.key)
  }

  const treeData2 = useMemo(() => {
    return editProperty(treeData, (item, i, indexs) => {
      const level = indexs.length
      // 2级节点可编辑, 3级节点可删除，1、2级节点可添加子节点
      Object.assign(item, {
        editable: level === 2,
        removeable: level === 3,
        addable: level < 3,
      })
      return item
    })
  }, [treeData])

  return (
    <EditAbleAntTree
      blockNode
      treeData={treeData2}
      onTreeDataUpdate={setTreeData}
      editNode={editNode}
      addNode={addNode}
      removeNode={removeNode}
    />
  )
}
```

### API 说明

```ts
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
```

#### TODO:

- [x] 节点支持搜索
- [x] bug: expandKeys
