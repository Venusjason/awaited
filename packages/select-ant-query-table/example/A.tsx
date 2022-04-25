import React, { useCallback, useMemo, useState } from 'react';
import SelectAntQueryTable from '@awaited/select-ant-query-table';
import { ColumnType } from 'antd/lib/table';
import { Button, Space, Table, Tag } from 'antd';
import { TriggerComponentProps } from '../QueryTable';

interface IItem {
  id: number;
  name: string;
}

const TriggerComponent = (props: TriggerComponentProps<IItem>) => {
  return (
    <Space
      style={{
        padding: '4px 8px',
        borderRadius: '2px',
        cursor: 'pointer',
        border: '1px solid rgb(217, 217, 217)',
      }}
      onClick={(e) => {
        // 要阻止冒泡，否则item点击也会触发
        e.stopPropagation();
        props.onClick();
      }}
    >
      {(!props.value || props.value.length === 0) && '请选择'}
      {props.value.map((item, i) => (
        <Tag closable key={item.id} onClose={() => props.remove(item.id, i)}>
          {item.name}
        </Tag>
      ))}
    </Space>
  );
};

export default () => {
  const columns: ColumnType<IItem>[] = [
    {
      dataIndex: 'id',
      title: '序号',
    },
    {
      dataIndex: 'name',
      title: '名称',
    },
  ];

  const service = async (
    result?: {
      current: number;
      pageSize: number;
    },
    queryFormValue,
  ) => {
    const current = result?.current || 1;
    const pageSize = result?.pageSize || 10;
    console.log('service run', current, pageSize, queryFormValue);
    const list = new Array(10).fill(1).map((_, i) => {
      const id = (current - 1) * pageSize + i;
      return {
        id,
        name: `第${id}个`,
      };
    });
    return {
      list,
      total: 100,
      current,
      pageSize,
    };
  };

  const [val, setVal] = useState<number[]>([]);
  const [valResult, setValResult] = useState([]);

  return (
    <SelectAntQueryTable<IItem>
      modalProps={{
        title: '人员选择',
      }}
      mode="radio"
      service={service}
      columns={columns}
      tableProps={{ rowKey: 'id' }}
      value={val}
      onChange={setVal}
      onValueChange={(v) => {
        console.log('onValueChange', v);
        setValResult(v);
      }}
      TriggerComponent={TriggerComponent}
    >
      {
        // (run) => <div>
        //   <Button onClick={() => run({name: '查询条件值'})}>查询</Button>
        // </div>
      }
    </SelectAntQueryTable>
  );
};
