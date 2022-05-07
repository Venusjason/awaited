import { defineComponent, ref, reactive } from 'vue-demi'
import { useLoadMore, ILoadMoreResponse } from '@weier/w-vue-hooks'
// 使用require code 语法
const dataSource = []
for (let i = 0; i < 10000; i++) {
  dataSource.push({
    id: i,
    title: `use load more , id ${i}`,
  })
}

export default defineComponent({
  setup() {
    const containerRef = ref(null)
    const refreshDeps = reactive({
      minId: 5,
      maxId: 20,
    })

    const asyncFn = async ({ pageSize = 5, pageIndex = 0, list = [] }: any = {}): Promise<
      ILoadMoreResponse<any>
    > => {
      const { minId, maxId } = refreshDeps
      let results = dataSource.filter(({ id }) => {
        return id > minId && id <= maxId
      })

      const total = results.length

      pageIndex++

      results = results.slice((pageIndex - 1) * pageSize, pageIndex * pageSize) || []

      await $sleep(2000)

      const arr = [...list, ...results]

      return {
        total,
        list: arr,
        pageSize,
        pageIndex,
      }
    }

    const { loadMore, reload, data, noMore, loading } = useLoadMore(asyncFn, {
      ref: containerRef,
      isNoMore: (d) => (d ? d?.list?.length >= d.total : false),
      refreshDeps: () => [refreshDeps.minId, refreshDeps.maxId],
      throttleInterval: 800,
    })

    return {
      loading,
      data,
      loadMore,
      noMore,
      reload,
      containerRef,
      refreshDeps,
    }
  },
  render() {
    const { loading, data, loadMore, reload, noMore } = this
    return (
      <div>
        <el-card>
          <p>查询条件</p>
          minId :{this.refreshDeps.minId}{' '}
          <el-input-number v-model={this.refreshDeps.minId} min={0} max={10000}></el-input-number>
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
    )
  },
})
