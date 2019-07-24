export let pipe = ([op, ...rest]) =>
  (...args) => rest.reduceRight((acc, fn) => fn(acc), op(...args))

export let go = (data, ...ops) => pipe(ops)(data)

export let zip = objs => {
  let keys = Object.keys(Object.assign({}, ...objs))
  let entries = keys.map(k => [k, objs.map(obj => obj[k])])

  return Object.fromEntries(entries)
}

export let pick = keys => filter(([key]) => keys.includes(key))

export let asPairs = fn => obj =>
  Object.fromEntries(fn(Object.entries(obj)))

export let filter = fn => asPairs(obj =>
  obj.filter(fn))

export let map = fn => asPairs(obj =>
  obj.map(([key, value]) => [key, fn(value, key)]))