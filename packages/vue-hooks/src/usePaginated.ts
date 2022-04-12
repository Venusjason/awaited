import { reactive, ref, toRefs, h as renderH, isVue2, watch, Ref } from 'vue-demi';

import { TableColumn as TableColumnV2 } from 'element-ui';
import { ElTableColumn as PlusTableColumn } from 'element-plus';

const TableColumn = isVue2 ? TableColumnV2 : PlusTableColumn;

import useRequest, { IOptions } from './useRequest';

const GLOBAL_PAGINATION_OPTION = {
  small: false,
  background: false,
  pagerCount: 7,
  disabled: false,
  ['hide-on-single-page']: true,
  pageSize: 10,
  pageSizes: [10, 15, 20, 25],
  layout: 'total, sizes, prev, pager, next, jumper',
};

/**
 * 设置全局配置
 *
 * @param option
 */
export const setGlobalPaginationOption = (
  option: Partial<typeof GLOBAL_PAGINATION_OPTION> & { [key: string]: any },
) => {
  Object.assign(GLOBAL_PAGINATION_OPTION, option);
};

export type IPagination = {
  currentPage: number;
  pageSize: number;
  [x: string]: any;
};

export type IPageResponse<T> = {
  data: T[];
  total: number;
};

/** 列表请求 */
export type ITableService<T> = (page: IPagination) => Promise<IPageResponse<T>>;

export type IElTableColumnItemProps<T> = { row: T; column: object; $index: number };

export interface IElTableColumnItem<T extends {}> {
  label?: string;
  prop?: keyof T;
  render?: (scope: IElTableColumnItemProps<T>) => any;
  [x: string]: any;
}

const ColumnItem = <T>(columnItem: IElTableColumnItem<T>) => {
  const { render, style, class: className, ...props } = columnItem;

  const Column = {
    key: (props.prop || '') as string,
    class: className || '',
    style: style || {},
  };
  Object.assign(Column, isVue2 ? { props } : props);
  if (render) {
    const slots = {
      default: (columnProps: IElTableColumnItemProps<T>) => render(columnProps),
    };

    Object.assign(Column, isVue2 ? { scopedSlots: slots } : slots);
  }

  // @ts-ignore
  return renderH(TableColumn, Column);
};

/**
 * @param columns
 * @returns Jsx.element
 */
export const JsxElTableColumns = <T>(columns: IElTableColumnItem<T>[]) => columns.map(ColumnItem);

export default function <K>(tableService: ITableService<K>, options?: IOptions) {
  const pagination = reactive<IPagination & { total: number }>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  const prevPagination = reactive<IPagination>({
    currentPage: 1,
    pageSize: GLOBAL_PAGINATION_OPTION.pageSize,
  });

  const tableData: Ref<K[]> = ref([]);

  const runService = async ({
    currentPage,
    pageSize,
    ...rest
  }: IPagination & { [x: string]: any }): Promise<IPageResponse<K>> => {
    try {
      const res = await tableService({ currentPage, pageSize, ...rest });
      // @ts-ignore
      tableData.value = res.data;
      pagination.total = res.total;
      pagination.currentPage = currentPage;
      pagination.pageSize = pageSize;
      return Promise.resolve(res);
    } catch (e) {
      // 接口异常 重置为上一次的分页
      pagination.pageSize = prevPagination.pageSize;
      pagination.currentPage = prevPagination.currentPage;
      return Promise.reject(e);
    }
  };

  const setPrevPagination = () => {
    prevPagination.currentPage = pagination.currentPage;
    prevPagination.pageSize = pagination.pageSize;
  };

  const onPaginationChange = {
    'current-change': (currentPage: number) => {
      setPrevPagination();
      run({
        currentPage,
        pageSize: pagination.pageSize,
      });
    },
    'size-change': (pageSize: number) => {
      setPrevPagination();
      pagination.currentPage = 1;
      run({
        currentPage: 1,
        pageSize,
      });
    },
  };

  const onPaginationChangeV3 = {
    onCurrentChange: onPaginationChange['current-change'],
    onSizetChange: onPaginationChange['size-change'],
  };

  const { loading, error, run } = useRequest(
    (customParams: { [x: string]: any } = {}) => {
      return runService(
        Object.assign(
          {},
          GLOBAL_PAGINATION_OPTION,
          { currentPage: pagination.currentPage, pageSize: pagination.pageSize },
          customParams,
        ),
      );
    },
    {
      ...options,
      paginated: true,
      // refreshDeps 更新 currentPage 置为1, 详见 watch
      refreshDeps: () => [],
    },
  );

  watch(options?.refreshDeps || [], () => {
    run({
      currentPage: 1,
      pageSize: pagination.pageSize,
    });
  });

  return {
    loading,
    error,
    run,
    data: tableData,
    // 针对el-pagination设置的
    pagination: ref({
      ...GLOBAL_PAGINATION_OPTION,
      ...toRefs(pagination),
      ...(isVue2 ? {} : onPaginationChangeV3),
      on: onPaginationChange,
    }),
  };
}
