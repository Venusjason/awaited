import { defineComponent } from 'vue-demi'
import { useLoadMore, ILoadMoreResponse } from '@weier/w-vue-hooks'
// 使用require code 语法

const resultData = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
export async function getLoadMoreList(
  { nextId, list } = {},
  limit: any,
): Promise<ILoadMoreResponse> {
  let start = 0
  if (nextId) {
    start = resultData.findIndex((i) => i === nextId)
  }
  const end = start + limit
  const results = resultData.slice(start, end).map((id) => ({
    id,
    name: `project ${id} (server time: ${Date.now()})`,
  }))
  const nId = resultData.length >= end ? resultData[end] : undefined

  await $sleep(1000)

  return {
    list: [...(list || []), ...results],
    nextId: nId,
  }
}

export default defineComponent({
  setup() {
    const { loadMore, reload, data, loading } = useLoadMore((d) => getLoadMoreList(d, 3), {
      cacheKey: 'loadMore',
    })
    return {
      loading,
      data,
      loadMore,
      reload,
    }
  },
  render() {
    const { loading, data, loadMore, reload } = this
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
    )
  },
})
