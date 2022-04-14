---
title: vue-hooks
group:
  path: /vue-hooks
nav:
  title: 组件
  path: /components
---

# `@awaited/vue-hooks`

- 结合 vue3 hooks 语法（支持 vue2 + composition-api）, `usePaginated` 可以用来替换 `QueryTable` 组件，使用 hooks 组件可以达到 ui 层的最大自定义
- api 设计借鉴了 [ahooks](https://ahooks.js.org/)
- 在 vue2、vue3 版本使用上，需要依赖[vue-demi](https://www.npmjs.com/package/vue-demi) , 需要使用者对 vue-demi 有一定了解

```
// 安装
npm i @awaited/vue-hooks -S

```

## 基础用法

> 简单说明（可选）

```tsx | pure
import { defineComponent } from '@vue/composition-api';

import { useRequest, setGlobalRequestOption } from '@awaited/vue-hooks';

setGlobalRequestOption({
  manual: false,
});

type Res = { num: string };

const service = (num): Promise<Res> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        num: (num || Math.ceil(Math.random() * 1000)).toString(),
      });
    }, 300);
  });
};

export default defineComponent({
  setup() {
    return useRequest<Res>(service);
  },
  render() {
    return (
      <div>
        <el-button type="primary" loading={this.loading} onClick={this.run}>
          按钮
        </el-button>{' '}
        {JSON.stringify(this.data, null, 2)}
      </div>
    );
  },
});
```

> 缓存模式， 适用于不频繁更新的数据（如枚举、权限、菜单），缓存有效期内 & 参数不变，多次调用会直接使用缓存结果 requireCode("~packages/w-vue-hooks/examples/useCache.tsx")

```tsx | pure
import { defineComponent } from '@vue/composition-api';

import { useRequest } from '@weier/w-vue-hooks';

type Res = { num: string };

const sleep = (delay = 3000) =>
  new Promise((r) => {
    setTimeout(() => {
      r();
    }, delay);
  });

const service = (num): Promise<Res> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        num: (num || Math.ceil(Math.random() * 1000)).toString(),
      });
    }, 300);
  });
};

// 缓存在 5000ms 后失效

const Example = defineComponent({
  setup() {
    return useRequest<Res>(service, {
      cacheKey: Symbol('cache A'),
      cacheTime: 5000,
    });
  },
  render() {
    return (
      <div>
        <el-button type="primary" loading={this.loading} onClick={this.run}>
          按钮
        </el-button>{' '}
        {JSON.stringify(this.data, null, 2)}
      </div>
    );
  },
});

const getUserInfo = async () => {
  await sleep();
  console.log('getUserInfo');
  const t = new Date().getTime();
  const joinTime = '2021-01-01 00:00:00';
  const serviedTime = t - new Date(joinTime).getTime();
  return {
    nick: '客服1号',
    gender: '男',
    joinTime,
    serviedTime,
  };
};

const CACHE_KEY_USER = Symbol('CACHE_KEY_USER');

const CACHE_KEY_USER_OPT = {
  cacheKey: CACHE_KEY_USER,
  cacheTime: 6000,
};

const UserName = defineComponent({
  setup() {
    const { data, loading, run } = useRequest(getUserInfo, CACHE_KEY_USER_OPT);

    return () => (
      <div>
        <span>昵称： {loading.value ? '...' : data.value?.nick}</span>
        <el-button onClick={run}>查询</el-button>
      </div>
    );
  },
});

const UserGender = defineComponent({
  setup() {
    const { data, loading, reset } = useRequest(getUserInfo, CACHE_KEY_USER_OPT);

    return () => (
      <div>
        性别： {loading.value ? '...' : data.value?.gender}
        <el-button onClick={reset}>reset刷新</el-button>
      </div>
    );
  },
});

const UserJoinTime = defineComponent({
  setup() {
    const { data, loading } = useRequest(getUserInfo, CACHE_KEY_USER_OPT);

    return () => (
      <div>
        <div>入职时间： {loading.value ? '...' : data.value?.joinTime}</div>
        <div>已工作： {loading.value ? '...' : data.value?.serviedTime}</div>
      </div>
    );
  },
});

export default defineComponent({
  render() {
    return (
      <div>
        <Example />
        <p>并发模式示例</p>
        <div>
          <UserName />
          <UserGender />
          <UserJoinTime />
        </div>
      </div>
    );
  },
});
```

```tsx | pure
import { defineComponent, ref, isVue2 } from 'vue-demi';

import axios from 'axios';

import {
  usePaginated,
  useRequest,
  JsxElTableColumns,
  setGlobalPaginationOption,
  IPageResponse,
  IPagination,
  IElTableColumnItem,
} from '@awaited/vue-hooks';

interface Item {
  name: string;
  status: number;
  platform: string;
  price: string;
}

type IResponseItem = {};

setGlobalPaginationOption({
  pageSizes: [10, 15, 20],
  layout: 'sizes, prev, pager, next, jumper, ->, total',
});

const QueryTable = defineComponent({
  setup() {
    const service = async ({ currentPage, pageSize }: IPagination) => {
      const res = await axios.get(
        `https://yapi.weierai.com/mock/360/goods/list?currentPage=${currentPage}&pageSize=${pageSize}`,
      );
      return {
        data: res.data.data.list,
        total: 40,
      } as IPageResponse<IResponseItem>;
    };

    const sortType = ref('');

    const setSortType = ({ order }) => {
      sortType.value = order;
    };

    const { loading, data, pagination, run, error } = usePaginated<IResponseItem>(service, {
      defaultError: '出错了',
      // 设置防抖
      debounceInterval: 200,
      // 排序条件变化 会自动触发重置第一页查询
      refreshDeps: () => [sortType.value],
    });
    const columns: IElTableColumnItem<IResponseItem>[] = [
      { prop: 'name', label: '名称' },
      { prop: 'status', label: '状态', sortable: true },
      { prop: 'platform', label: 'platform' },
      // {
      //   prop: "price",
      //   label: "价格",
      //   render: ({ row, $index }) => {
      //     return `${$index} : ${row.price}`;
      //   },
      // },
    ];

    return () => {
      const { on, ...attrs } = pagination.value;
      const events = {
        onCurrentChange: on['current-change'],
        onSizeChange: on['size-change'],
      };
      return (
        <div>
          <pre>vue version {isVue2 ? '2.x' : '3'}</pre>
          <div>
            <el-button onClick={run} type="primary">
              查询
            </el-button>
          </div>
          <el-table data={data.value} on={{ 'sort-change': setSortType }} SortChange={setSortType}>
            {JsxElTableColumns(columns)}
          </el-table>
          {isVue2 ? (
            <el-pagination attrs={attrs} on={on} />
          ) : (
            <el-pagination {...{ ...attrs, ...events }} />
          )}
        </div>
      );
    };
  },
});

export default QueryTable;
```

## setGlobalPaginationOption

- 设置分页全局参数，属性参考 `el-pagination` 组件

```js
import { setGlobalPaginationOption } from '@weier/w-vue-hooks';

setGlobalPaginationOption({
  pageSizes: [10, 15, 20],
  layout: 'sizes, prev, pager, next, jumper, ->, total',
});
```

## JsxElTableColumns

- `el-table-column` 组件的 jsx 版本

```tsx | pure
import { JsxElTableColumns } from '@weier/w-vue-hooks'

const colunms = [
  { prop: 'name', label: '名称' },
  { prop: 'status', label: '状态' },
  { prop: 'platform', label: 'platform' },
  {
    prop: 'price',
    label: '价格',
    render: ({ row, $index }) => {
      return `${$index} : ${row.price}`
    }
  }
]

<el-table>
  { JsxElTableColumns(colunms) }
</el-table>

```

## useRequest Service

- 只要满足 Promise 即可

## useRequest Options: IRequestOption

| 参数                      | 说明                        | 类型    | 可选值 | 默认值 |
| ------------------------- | --------------------------- | ------- | ------ | ------ |
| manual                    | 是否手动调用                | boolean | ——     | false  |
| filterServiceInvalidValue | 自动过滤 service 中无效入参 | boolean | -      | true   |
| initialData               | service 默认返回值          | any     | ——     | -      |
| defaultError              | service 默认异常            | any     | -      |        |
| debounceInterval          | 防抖 delay                  | number  | -      | 0      |
| throttleInterval          | 节流 delay                  | number  | -      | 0      |

```ts
export type IService<T> = (...args: any[]) => Promise<T>;

export interface IOptions {
  /** 手动调用 */
  manual?: boolean;
  /** 自动过滤service中无效入参 */
  filterServiceInvalidValue?: boolean;
  /** Data 默认值 */
  initialData?: any;
  /** 默认错误返回 */
  defaultError?: string;
  /** 防抖间隔, 单位为毫秒，设置后，请求进入防抖模式 */
  debounceInterval?: number;
  /** 节流间隔, 单位为毫秒，设置后，请求进入节流模式。 */
  throttleInterval?: number;
  /**
   * 在 manual = false 时，refreshDeps 变化，会触发 service 重新执行 分页模式下， refreshDeps 变化，会重置 currentPage
   * 到第一页，并重新发起请求，一般你可以把依赖的条件放这里。
   */
  refreshDeps?: WatchSource;
  /** 缓存键 要求必须唯一， 建议用symbol，paginated loadMore 模式下无效 函数service入参变化，缓存也会失效 */
  cacheKey?: any;
  /** 设置缓存数据回收时间。默认缓存数据 5 分钟后回收 如果设置为 -1, 则表示缓存数据永不过期 需要配和 cacheKey 使用 */
  cacheTime?: number;

  /** 内部调用，请勿使用 */
  loadMore?: boolean;
  /** 内部调用，请勿使用 */
  paginated?: boolean;
}
```

## usePaginated Service

- 只要满足 Promise 即可

## usePaginated Service

- 只要满足 Promise 即可

## usePaginated Option

- el-pagination api

```ts
interface IPaginatedOption extends IRequestOption {
  small: boolean;
  background: boolean | string;
  pagerCount: number;
  ['hide-on-single-page']: boolean;
  disabled: boolean;
  pageSize: number;
  pageSizes: number[];
  layout: string;
}
```

## useLoadMore

> `useLoadMore` 适用在列表滚动加载的场景，支持滚动、自动重载

requireCode("~packages/w-vue-hooks/examples/useLoadMore.tsx")

```tsx | pure
import { defineComponent } from 'vue-demi';
import { useLoadMore, ILoadMoreResponse } from '@weier/w-vue-hooks';
// 使用require code 语法

const resultData = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export async function getLoadMoreList(
  { nextId, list } = {},
  limit: any,
): Promise<ILoadMoreResponse> {
  let start = 0;
  if (nextId) {
    start = resultData.findIndex((i) => i === nextId);
  }
  const end = start + limit;
  const results = resultData.slice(start, end).map((id) => ({
    id,
    name: `project ${id} (server time: ${Date.now()})`,
  }));
  const nId = resultData.length >= end ? resultData[end] : undefined;

  await $sleep(1000);

  return {
    list: [...(list || []), ...results],
    nextId: nId,
  };
}

export default defineComponent({
  setup() {
    const { loadMore, reload, data, loading } = useLoadMore((d) => getLoadMoreList(d, 3), {
      cacheKey: 'loadMore',
    });
    return {
      loading,
      data,
      loadMore,
      reload,
    };
  },
  render() {
    const { loading, data, loadMore, reload } = this;
    return (
      <div>
        <ul>
          {data?.list?.map((item) => (
            <li key={item.id}>
              {item.id} - {item.name}
            </li>
          ))}
        </ul>
        <el-button type="button" onClick={loadMore} disabled={!data?.nextId}>
          {loading ? 'loading' : data?.nextId ? 'click to load more' : 'no more'}
        </el-button>
        <el-button type="primary" onClick={reload} disabled={!!data?.nextId}>
          reload
        </el-button>
      </div>
    );
  },
});
```

> 上拉自动加载 & 依赖项变更自动重新加载

requireCode("~packages/w-vue-hooks/examples/useLoadMoreRef.tsx")

```tsx | pure
import { defineComponent, ref, reactive } from 'vue-demi';
import { useLoadMore, ILoadMoreResponse } from '@weier/w-vue-hooks';
// 使用require code 语法
const dataSource = [];
for (let i = 0; i < 10000; i++) {
  dataSource.push({
    id: i,
    title: `use load more , id ${i}`,
  });
}

export default defineComponent({
  setup() {
    const containerRef = ref(null);
    const refreshDeps = reactive({
      minId: 5,
      maxId: 20,
    });

    const asyncFn = async ({ pageSize = 5, pageIndex = 0, list = [] }: any = {}): Promise<
      ILoadMoreResponse<any>
    > => {
      const { minId, maxId } = refreshDeps;
      let results = dataSource.filter(({ id }) => {
        return id > minId && id <= maxId;
      });

      const total = results.length;

      pageIndex++;

      results = results.slice((pageIndex - 1) * pageSize, pageIndex * pageSize) || [];

      await $sleep(2000);

      const arr = [...list, ...results];

      return {
        total,
        list: arr,
        pageSize,
        pageIndex,
      };
    };

    const { loadMore, reload, data, noMore, loading } = useLoadMore(asyncFn, {
      ref: containerRef,
      isNoMore: (d) => (d ? d?.list?.length >= d.total : false),
      refreshDeps: () => [refreshDeps.minId, refreshDeps.maxId],
      throttleInterval: 800,
    });

    return {
      loading,
      data,
      loadMore,
      noMore,
      reload,
      containerRef,
      refreshDeps,
    };
  },
  render() {
    const { loading, data, loadMore, reload, noMore } = this;
    return (
      <div>
        <el-card>
          <p>查询条件</p>
          minId :{this.refreshDeps.minId} <el-input-number
            v-model={this.refreshDeps.minId}
            min={0}
            max={10000}
          ></el-input-number>
          maxId : {this.refreshDeps.maxId}
          <el-input-number v-model={this.refreshDeps.maxId} min={0} max={10000}></el-input-number>
          <el-button type="primary" onClick={reload} disabled={loading}>
            Reload
          </el-button>
        </el-card>
        <ul ref="containerRef" style={{ height: '200px', overflowY: 'auto' }}>
          {data.list.map((item) => (
            <li style={{ height: 50, borderBottom: '1px', lineHeight: '50px' }}>{item.title}</li>
          ))}
        </ul>
        <div>
          {!noMore && (
            <el-button type="button" onClick={loadMore} disabled={loading}>
              {loading ? 'Loading more...' : 'Click to load more'}
            </el-button>
          )}

          {noMore && <span>No more data</span>}

          <span style={{ float: 'right', fontSize: 12 }}>total: {data?.total}</span>
        </div>
      </div>
    );
  },
});
```

```ts
/** Service 返回值 */
export type ILoadMoreResponse<ListItem = any> = {
  list: ListItem[];
  total?: number;
  [key: string]: any;
};

export type ILoadMoreOptions = IOptions & {
  /** 容器的 ref，如果存在，则在滚动到底部时，自动触发 loadMore */
  ref?: Ref<HTMLElement>;
  /** 判断是否还有更多数据的函数 */
  isNoMore?: (r: ILoadMoreResponse | undefined) => boolean;
  /** 下拉自动加载，距离底部距离阈值 */
  threshold?: number;
};

/** 数据源获取 上次返回值作为下次请求的入参 */
export type ILoadMoreService<T> = (p: ILoadMoreResponse<T> | undefined) => ILoadMoreResponse<T>;
```

## TODO

- fetchKey

## 其他备注（可选）
