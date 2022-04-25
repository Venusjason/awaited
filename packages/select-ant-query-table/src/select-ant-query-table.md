---
title: select-ant-query-table
group:
  path: /select-ant-query-table
nav:
  title: 组件
  path: /components
---

# `@awaited/select-ant-query-table`

### 组件背景

用于实现表单内 选择复杂数据的组件，如商品选择器

### 组件功能

### 组件实现

### 作者

## Install

Using npm:

```bash
$ npm install --save @awaited/select-ant-query-table
```

or using yarn:

```bash
$ yarn add @awaited/select-ant-query-table
```

### 使用示例

<code src="../example/A.tsx"></code>

### api

```ts
export interface TriggerComponentProps<T> {
  value: T[];
  rowKeyValue: string | number[];
  // 删除
  remove: (id: string, index: number) => void;
  onClick: () => void;
}

export interface SelectAntQueryTableProps<T, TData, TParams> {
  value: string | number[];
  onChange: (v: string | number[]) => void;
  /** 单选 or 多选 默认 checkbox */
  mode?: 'checkbox' | 'radio';
  onValueChange?: (v: T[]) => void;
  /** 触发按钮自定义 */
  TriggerComponent?: (props: TriggerComponentProps<T>) => ReactNode;
  service: Service<TData, TParams>;
  /** 根据id反查数据 */
  getItemsService: (v: any[]) => Promise<T[]>;
  /** 同 ant table columns */
  columns: (ColumnGroupType<T> | ColumnType<T>)[];
  /** 同 ant table tableProps */
  tableProps?: TableProps<T>;
  /** 同 ant modal props */
  modalProps?: ModalProps;
  /** 表单上的查询项 */
  children?: (run: any) => ReactNode;
  /** 同 ant pagination props */
  paginationProps?: any;
}
```

<!-- ### API 说明

| api | 描述 | 数据类型 | 默认值 |
| --- | ---- | -------- | ------ |
| -   | -    | -        | -      | -->
