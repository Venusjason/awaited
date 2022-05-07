/**
 * 模拟一个异步io
 */
export default (
  data: unknown = undefined,
  delay: number = 100
) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data)
    }, delay)
  })