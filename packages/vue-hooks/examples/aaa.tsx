import { defineComponent } from 'vue-demi'

// 使用require code 语法
export default defineComponent({
  setup() {
    return () => (
      <div>
        <p>requireCode ("~packages/w-vue-hooks/examples/aaa.tsx")</p>
        <span>请去掉 requireCode 后的空隙</span>
      </div>
    )
  },
})
