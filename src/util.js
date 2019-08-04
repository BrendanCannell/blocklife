export let apply = arg => fn => fn(arg)

export let asPairs = fn => obj =>
  Object.fromEntries(fn(Object.entries(obj)))

export let filter = fn => asPairs(obj =>
  obj.filter(fn))

export let go = (data, ...ops) => pipe(ops)(data)

// (B -> C) -> A -> (A -> B) -> C
export let lift = after => fn => before =>
  after(before(fn))

export let liftOpts = afterOpts => fn => beforeOpts =>
  fn({...beforeOpts, ...afterOpts})

export let log = x => console.log(x) || x

export let map = fn => asPairs(obj =>
  obj.map(([key, value]) => [key, fn(value, key)]))

export let mapKeys = fn => asPairs(obj =>
  obj.map(([key, value]) => [fn(key, value), value]))

export let pick = keys => filter(([key]) => keys.includes(key))

export let pipe = ([op, ...rest]) =>
  (...args) => rest.reduce((acc, fn) => fn(acc), op(...args))

export let pipeCtx = ([op, ...ops]) => {
  function pipeCtx(ctx, ...args) {
    var result = op(ctx, ...args)
    for (let fn of ops)
      result = fn(ctx, result)
    return result
  }
  return pipeCtx
}

export let setName = (fn, name) => {
  Object.defineProperty(fn, 'name', {value: name})
  return fn
}

export let stripLeft = prefix => mapKeys(name => {
  if (prefix !== name.substring(0, prefix.length))
    throw Error(`Expected prefix '${prefix}': ${name}`)
  return name.substring(prefix.length)
})

export let stripRight = suffix => mapKeys(name => {
  if (suffix !== name.substring(name.length - suffix.length))
    throw Error(`Expected suffix '${suffix}': ${name}`)
  return name.substring(0, name.length - suffix.length)
})

export let withNames = map((fn, name) => setName(fn, name))

export let zip = objs => {
  let keys = Object.keys(Object.assign({}, ...objs))
  let entries = keys.map(k => [k, objs.map(obj => obj[k])])
  return Object.fromEntries(entries)
}