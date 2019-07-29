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

export let name = namedFn => {
  let [[name, fn]] = Object.entries(namedFn)

  Object.defineProperty(fn, 'name', {value: name})

  return fn
}

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

export let withNames = map((fn, name) => name({[name]: fn}))

export let zip = objs => {
  let keys = Object.keys(Object.assign({}, ...objs))
  let entries = keys.map(k => [k, objs.map(obj => obj[k])])

  return Object.fromEntries(entries)
}