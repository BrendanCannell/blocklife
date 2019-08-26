// import {inspect as UtilInspect} from 'util'

export let apply = arg => fn => fn(arg)

export let asPairs = fn => obj =>
  Object.fromEntries(fn(Object.entries(obj)))

export let ceilPow2 = n => Math.pow(2, Math.ceil(Math.log2(n)), 2)

export let ceilBy = (d, n) => Math.ceil(n / d) * d

export function checkIterable(x) {
  if (!isIterable(x)) throw TypeError("Expected iterable: " + x)
  return true
}

export function collectNamedArgs(fn) {
  let collectNamedArgs = collected => function collectingArgs(next) {
    let type = typeof next
      , result =
            type === 'undefined' ? log(fn(collected))
          : type === 'object'    ? collectNamedArgs({...collected, ...next})
          : null
    if (!result) throw TypeError("Expected object: " + next)
    log({collected, next, result})
    return fn.name
      ? setName(result, 'collectingArgs:' + fn.name)
      : result
  }

  return collectNamedArgs({})
}

export let filter = fn => obj => {
  let filterPair = ([key, val]) => fn(val, key, obj)
  return asPairs(pairs => pairs.filter(filterPair))(obj)
}

export let floorBy = (d, n) => Math.floor(n / d) * d

export let forEach = xf => function forEach(xs) {
  for (let [key, value] of entries(xs))
    xf(value, key, xs)
  return xs
}

export let go = (data, ...ops) => pipe(ops)(data)

// export let inspect = x => (log(UtilInspect(x, false, null, true)), x)

export let isIterable = x => x && typeof x[Symbol.iterator] === 'function'

// (B -> C) -> A -> (A -> B) -> C
export let lift = after => fn => before =>
  after(before(fn))

export let liftOpts = afterOpts => fn => beforeOpts =>
  fn({...beforeOpts, ...afterOpts})

export let log = x => console.log(x) || x

export let map = xf => function map(xs) {
  var result = empty(xs)
  for (let [key, value] of entries(xs))
    result[key] = xf(value, key, xs)
  return result
}

export let mapKeys = xf => function mapKeys(xs) {
  var result = empty(xs)
  for (let [key, value] of entries(xs))
    result[xf(key, value, xs)] = value
  return result
}

export let pick = keys =>
  checkIterable(keys)
  && filter((_, key) => keys.includes(key))

export let pipe = ops => {
  checkIterable(ops)
  let [op, ...rest] = ops
  return (...args) => rest.reduce((acc, fn) => fn(acc), op(...args))
}

export let pipeCtx = ([op, ...ops]) => {
  function pipeCtx(ctx, ...args) {
    var result = op(ctx, ...args)
    for (let fn of ops)
      result = fn(ctx, result)
    return result
  }
  return pipeCtx
}

export function setName(fn, name) {
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

export let zip = outer => {
  let outerIsArray = isArray(outer)
    , outerArray = outerIsArray ? outer : Object.values(outer)
    , innerKeys = new Set(outerArray.flatMap(keys))
    , innerIsArrays = outerArray.map(isArray)
    , innersAreArrays = innerIsArrays[0]
  if (!same(innerIsArrays))
    throw TypeError("Inner values must be all arrays or all non-arrays: " + outerArray)
  var result = empty(innersAreArrays)
  for (let k of innerKeys)
    result[k] = map(inner => inner[k])(outer)
  return result
}

export function same(xs) {
  let [first, ...rest] = xs
  for (let x of rest)
    if (x !== first)
      return false
  return true
}

let isArray = Array.isArray

let empty = obj => isArray(obj) ? [] : {}

let collectionMethod = key => x =>
  isArray(x)
    ? [...x[key]()]
    : Object[key](x)
let entries = collectionMethod('entries')
let keys    = collectionMethod('keys')
let values  = collectionMethod('values')