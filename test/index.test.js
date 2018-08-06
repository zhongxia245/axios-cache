import Axios from 'axios'
import wrapper from '../src/index'

const pause = function(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

let axiosInstance = Axios.create()

axiosInstance.interceptors.response.use(resp => {
  if (resp.data.success) {
    return resp.data.data
  }
})

// 添加缓存插件
axiosInstance = wrapper(axiosInstance, {
  local: true,
  localTTL: 2 * 1000,
  excludeHeaders: true
})

const TEST_URLS = {
  topic: 'https://cnodejs.org/api/v1/topics'
}

test('axios base function test', async () => {
  expect.assertions(2) // 异步请求，需要添加这个标识
  const data = await axiosInstance.get(TEST_URLS['topic'])
  expect(data).not.toBeNull()

  const data1 = await axiosInstance.get(TEST_URLS['topic'], { count: 10 })
  expect(data1).not.toBeNull()
})

test('__addFilter and __removeFilter test', async () => {
  const reg = /api\/v1\/topics/
  expect(axiosInstance.__cacher.filters.length).toBe(0)

  axiosInstance.__addFilter(reg)
  expect(axiosInstance.__cacher.filters.length).toBe(1)
  expect(axiosInstance.__cacher.filters.indexOf(reg) !== -1)

  axiosInstance.__removeFilter(reg)
  expect(axiosInstance.__cacher.filters.length).toBe(0)
  expect(axiosInstance.__cacher.filters.indexOf(reg) === -1)
})

test('match filter request path , should cached to localStorage', async () => {
  const reg = /api\/v1\/topics/
  expect.assertions(1)
  axiosInstance.__addFilter(reg)
  await axiosInstance.get(TEST_URLS['topic'])
  expect(localStorage.getItem[TEST_URLS['topic']]).not.toBeNull()
})

test('remove localStorage test', async () => {
  expect(localStorage.getItem[TEST_URLS['topic']]).not.toBeNull()
  axiosInstance.__clearCache()
  expect(localStorage.getItem[TEST_URLS['topic']]).toBeUndefined()
})

test('localStorage cache timeout test', async () => {
  const reg = /api\/v1\/topics/
  expect.assertions(1)
  axiosInstance.__addFilter(reg)
  await axiosInstance.get(TEST_URLS['topic'])
  await pause(3 * 1000)
  expect(localStorage.getItem[TEST_URLS['topic']]).toBeUndefined()
})
