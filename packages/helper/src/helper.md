---
title: helper
group:
  path: /helper
nav:
  title: 组件
  path: /components
---

# @awaited/helper

> 常见 js 函数工具

### Install

Using npm:

```bash
$ npm install --save @awaited/helper
```

or using yarn:

```bash
$ yarn add @awaited/helper
```

## 函数

### sleep

> 模拟异步 io 操作，基于 setTimeout

```tsx
import React, { useState, useEffect } from 'react'
import { sleep } from '@awaited/helper'
import { Button, Spin } from 'antd'

export default () => {
  const [count, setCount] = useState(0)
  const [pending, setPending] = useState(false)

  const update = async () => {
    setPending(true)
    await sleep(undefined, 2000)
    setPending(false)
    setCount(count + 1)
  }

  return (
    <div>
      <h2> {pending ? <Spin /> : <div>count: {count}</div>} </h2>
      <Button onClick={update}>更新count</Button>
    </div>
  )
}
```

#### api

```ts
(data?: unknown, delay?: number) => Promise<unknown>
```

### editProperty

> 递归 修改、增加 item 属性,用作数据字段批量转换

```tsx
import React, { useState, useEffect } from 'react'
import { editProperty, sleep } from '@awaited/helper'
import { Button, Spin, Row, Col } from 'antd'

const data = [
  {
    label: '1',
    value: '1',
    children: [
      {
        label: '1.1',
        value: '1.1',
      },
    ],
  },
]

export default () => {
  const [dataSource, setDataSource] = useState(data)
  const [pending, setPending] = useState(false)

  const update = async () => {
    setPending(true)
    await sleep()
    setPending(false)
    setDataSource(
      editProperty(dataSource, (item, index) => {
        const { children, label, value } = item
        return {
          title: label,
          value,
          index,
          children,
        }
      }),
    )
  }

  return (
    <div>
      <Row>
        <Col span={12}>
          <div>before:</div>
          <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </Col>
        <Col span={12}>
          <div>after:</div>
          <pre>
            <code>{JSON.stringify(dataSource, null, 2)}</code>
          </pre>
        </Col>
      </Row>
      <Button onClick={update} loading={pending}>
        更新数据
      </Button>
    </div>
  )
}
```

#### api

```ts
function editProperty<T, P = T>(
  dataSource: T[],
  /** 添加属性的方法 */
  editFn: (item: T, i: number) => P,
  childrenKey?: string,
): P[]
```

### filterDataSource

> 递归 过滤数组符合的匹配项，用作数据过滤

```tsx
import React, { useState, useEffect } from 'react'
import { filterDataSource, sleep } from '@awaited/helper'
import { Button, Spin, Row, Col } from 'antd'

const data = [
  {
    label: '1',
    value: '1',
    children: [
      {
        label: '1.1',
        value: '1.1',
      },
    ],
  },
  {
    label: '2',
    value: '2',
    children: [
      {
        label: '2.1',
        value: '2.1',
      },
      {
        label: '2.2',
        value: '2.2',
        children: [
          {
            label: '2.2.1',
            value: '2.2.1',
          },
        ],
      },
    ],
  },
]

export default () => {
  const [dataSource, setDataSource] = useState(data)
  const [pending, setPending] = useState(false)

  const update = async () => {
    setPending(true)
    await sleep()
    setPending(false)
    setDataSource(
      filterDataSource(dataSource, (item, index) => {
        const { children, label, value } = item
        return value.startsWith('2')
      }),
    )
  }

  return (
    <div>
      <Row>
        <Col span={12}>
          <div>before:</div>
          <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </Col>
        <Col span={12}>
          <div>after:</div>
          <pre>
            <code>{JSON.stringify(dataSource, null, 2)}</code>
          </pre>
        </Col>
      </Row>
      <Button onClick={update} loading={pending}>
        更新数据
      </Button>
    </div>
  )
}
```

#### api

```ts
function filterDataSource<T>(
  dataSource: T[],
  filterFn: (item: T, index: number) => boolean,
  childrenKey?: string,
): T[]
```

### 作者

金星
