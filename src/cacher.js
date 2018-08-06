/**
 * 缓存包装器
 * @export
 * @class Cacher
 */
export class Cacher {
  constructor(option) {
    this.cacheMap = new Map()
    this.option = option || {}
    this.maxCacheSize = this.option.maxCacheSize || 15 // 最大缓存量
    this.ttl = this.option.ttl // 过期时间
    this.local = this.option.local || false // 使用本地缓存
    this.localTTL = this.option.localTTL || 5 * 60 * 1000 // 本地缓存默认为5分钟
    this.filters = [] // 需要缓存的接口
    this.excludeHeaders = this.option.excludeHeaders || false
    this.prefix = 'axios-cache-' // localStorate 缓存前缀
  }

  /**
   * [addFilter 添加匹配规则]
   * @param {[reg]} reg
   */
  addFilter(reg) {
    this.filters.push(reg)
  }

  /**
   * [removeFilter 移除匹配规则]
   * @param  {[reg]} reg
   */
  removeFilter(reg) {
    let index = this.filters.indexOf(reg)
    if (index !== -1) {
      this.filters.splice(index, 1)
    }
  }

  /**
   * [setCache 添加缓存]
   * @param {[any]} key
   * @param {[any]} value
   */
  setCache(key, value) {
    if (this.excludeHeaders) delete key.headers

    let cacheKey = this.prefix + JSON.stringify(key)

    this.cacheMap.set(cacheKey, value)

    if (this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
      this.cacheMap.delete([...this.cacheMap.keys()][0])
    }
    if (this.ttl) {
      setTimeout(() => {
        if (this.hasCache(key)) {
          this.cacheMap.delete(cacheKey)
        }
        if (localStorage[cacheKey]) {
          localStorage.removeItem(cacheKey)
        }
      }, this.ttl)
    }

    // 使用本地缓存
    if (this.local) {
      localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: value }))
    }
  }

  /**
   * [needCache 检查是否命中匹配规则]
   * @param  {[obj]} option
   * @return {[boolean]}
   */
  needCache(option) {
    return this.filters.some(reg => {
      return reg.test(option.url)
    })
  }

  /**
   * [hasCache 是否已有缓存]
   * @param  {[any]}  key
   * @return {Boolean}
   */
  hasCache(key) {
    let cacheKey = this.prefix + JSON.stringify(key)

    let existCache = !!this.cacheMap.has(cacheKey)

    // 内存中没有，判断缓存是否过期，如果没有过期则返回已有缓存
    if (!existCache) {
      let localData = JSON.parse(localStorage.getItem(cacheKey))
      if (localData && Date.now() < localData.time + this.localTTL) {
        existCache = true
      } else {
        localStorage.removeItem(cacheKey)
      }
    }

    return existCache
  }

  /**
   * [getCache 获取缓存内容]
   * @param  {[any]} key
   * @return {[any]}
   */
  getCache(key) {
    let cacheKey = this.prefix + JSON.stringify(key)

    let data = this.cacheMap.get(cacheKey)

    // 先拿内存数据，没有在拿本地缓存数据
    if (!data && this.local && localStorage.getItem(cacheKey)) {
      let localData = JSON.parse(localStorage.getItem(cacheKey))
      data = localData.data
    }

    return data
  }

  /**
   * [clear 清空缓存]
   */
  clear() {
    this.cacheMap.clear()

    // 清除localStorage缓存axios数据
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.indexOf(this.prefix) !== -1) {
        localStorage.removeItem(key)
      }
    }
  }
}
