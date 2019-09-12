import * as G from "./infinite-grid"
import Store from "./canonical-store"
import letStore from "./let-store"

export default function Life(locations = []) {
  return FromLiving(locations)
}

Life.prototype.add = function(location) {
  let copy = FromLiving([...this.values()])
  copy.grid = letStore(copy.store, () => G.Set(copy.grid, [[location, true]]))
  return copy
}

Life.prototype.has = function(location) {
  return G.Get(this.grid, location)
}

Life.prototype.remove = function(location) {
  let copy = FromLiving([...this.values()])
  copy.grid = letStore(copy.store, () => G.Set(copy.grid, [[location, false]]))
  return copy
}

Life.prototype.step = function({count = 1} = {}) {
  var store1 = Store()
    , store2 = Store()
    , grid = this.grid
  for (let i = 0; i < count; i++) {
    var store = i % 2 === 0 ? store1 : store2
    store.Clear()
    grid = letStore(store, () => G.Next(grid))
  }
  return MakeLife(grid, store)
}

Life.prototype.values = function() {
  return G.Living(this.grid)
}

Life.BlurBuffer = function(opts) {
  let blurBuffer = G.BlurBuffer({maxSteps: 1, ...opts})
    , wrappedBlurBuffer = {add, draw, clear, get: () => blurBuffer}
  return wrappedBlurBuffer

  function add(life, viewport) {
    G.AddToBlur(life.grid, blurBuffer, viewport)
    return wrappedBlurBuffer
  }
  function clear() {
    G.ClearBlur(blurBuffer)
    return wrappedBlurBuffer
  }
  function draw(imageData, colors, viewport) {
    let {data, width, height} = imageData
      , i32colors = colors.map(rgba => new Int32Array(new Uint8ClampedArray(rgba).buffer)[0])
      , i32data = new Int32Array(data.buffer)
      , drawData = {
          data: i32data,
          width,
          height
        }
    G.DrawBlur(i32colors, blurBuffer, drawData, viewport)
    return imageData
  }
}

function MakeLife(grid, store) {
  let l = Object.create(Life.prototype)
  l.grid = grid
  l.store = store
  return l
}

function FromLiving(locations) {
  let store = Store()
    , grid = letStore(store, () => G.FromLiving(locations))
  return MakeLife(grid, store)
}