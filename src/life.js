let log = x => console.log(x) || x

let DATA = Symbol('Life.DATA')

function Life(value) {
  let obj = Object.assign(Object.create(UnsafeMethods), {[DATA]: value})

  let {proxy, revoke} = Proxy.revocable(obj, {
    get(target, name) {
      if (name === 'unsafe') {
        revoke()

        return target
      } else if (obj.hasOwnProperty(name))
        return obj[name]
      else
        return SafeMethods[name]
    }
  })

  return proxy
}

let SafeMethods = {
  get() {
    return this[DATA]
  },
  increment() {
    return Life(this[DATA] + 1)
  }
}

let UnsafeMethods = Object.assign(
  Object.create(SafeMethods),
  {
    increment() {
      this[DATA]++

      return this
    }
  }
)

var x = Life(0)
log(x.get())
log(x.increment())
log(x.get())
var unsafe = x.unsafe
log(unsafe.increment().increment().get())
log(x.get())