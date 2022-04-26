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

> 用于实现表单内 选择复杂数据的组件，如商品选择器

### 组件功能
  * 支持单选、多选
  * 支持触发模块自定义
  * 支持列表数据展示自定义
  * 支持查询表单自定义

### 组件实现
  * 依赖 antd :
    - modal
    - table

### 作者
  * 金星
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
export interface TriggerComponentProps<T = any> {
  value: T[];
  rowKeyValue: (string | number)[];
  // 删除
  remove: (id: string | number, index: number) => void;
  onClick: () => void;
}

export interface SelectAntQueryTableProps<
  T extends Record<string, any>,
  TData extends Data,
  TParams extends Params,
> {
  value: (string | number)[];
  onChange: (v: (string | number)[]) => void;
  /** 单选 or 多选 默认 checkbox */
  mode?: 'checkbox' | 'radio';
  onValueChange?: (v: T[]) => void;
  /** 
   * 触发按钮自定义 
   * */
  TriggerComponent?: (props: TriggerComponentProps<T>) => ReactNode;
  service: Service<TData, TParams>;
  /** 
   * 根据id反查数据 
   * 一般用于数据回显使用
   * */
  getItemsService: (v: (string | number)[]) => Promise<T[]>;
  /** 
   * 同 ant table columns 
   * */
  columns: (ColumnGroupType<T> | ColumnType<T>)[];
  /** 
   * 同 ant table tableProps 
   * https://ant.design/components/table-cn/#API
   * */
  tableProps?: TableProps<T>;
  /** 
   * 同 ant modal props 
   * https://ant.design/components/modal-cn/#API
   * */
  modalProps?: ModalProps;
  /** 
   * 表单上的查询项 
   * formValue 作为 service 的第二个参数传入
   * */
  children?: (run: (formValue: object) => void) => ReactNode;
  /** 
   * 同 ant pagination props 
   * https://ant.design/components/pagination-cn/#API
   * */
  paginationProps?: any;
}
```

<!-- ### API 说明

| api | 描述 | 数据类型 | 默认值 |
| --- | ---- | -------- | ------ |
| -   | -    | -        | -      | -->
