# axios-cache-plugin-localstorage

Help you cache GET request when using axios.

## Install

```bash
npm install axios-cache-plugin-localstorage --save
```

or

```bash
yarn add axios-cache-plugin-localstorage
```

## Usage

Add cache feature to axios

```javascript
import axios from 'axios'
import wrapper from 'axios-cache-plugin-localstorage'

let http = wrapper(axios, {
  maxCacheSize: 15,
  local: true, // localstorage cache
  localTTL: 60 * 1000 //  localstorage cache timeout time
})
export default http
```

or axios instance

```javascript
import axios from 'axios'
import wrapper from 'axios-cache-plugin-localstorage'

let http = axios.create({
  withCredentials: false
})

let httpProxy = wrapper(http, {
  maxCacheSize: 15
})
export default httpProxy
```

## API

By default, `axios-cache-plugin-localstorage` won't cache any GET request unless you add filters.

Filters are Regexps, only the GET request whose url hit the filter reg will be cached.

### instance.\_\_addFilter(reg)

example:

```javascript
import axios from 'axios'
import wrapper from 'axios-cache-plugin-localstorage'

let http = wrapper(axios, {
  maxCacheSize: 15
})
http.__addFilter(/getItemInfoByIdsWithSecKill/)

http({
  url: 'http://example.com/item/getItemInfoByIdsWithSecKill',
  method: 'get',
  params: {
    param: JSON.stringify({
      debug_port: 'sandbox1'
    })
  }
})

// now the request http://example.com/item/getItemInfoByIdsWithSecKill?param=%7B%22debug_port%22:%22sandbox1%22%7D has been cached
```

### instance.\_\_removeFilter(reg)

Remove filter.

### instance.\_\_clearCache()

Clear cache.

## wrapper options

Options are optional.

```javascript
let http = wrapper(axios, {
  maxCacheSize: 15, // cached items amounts. if the number of cached items exceeds, the earliest cached item will be deleted. default number is 15.
  ttl: 60000, // time to live. if you set this option the cached item will be auto deleted after ttl(ms).
  excludeHeaders: true // should headers be ignored in cache key, helpful for ignoring tracking headers
})
```

## LICENSE

MIT
