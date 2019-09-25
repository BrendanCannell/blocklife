import * as G from "./infinite-grid"
import Store from "./canonical-store"
import LetStore from "./let-store"

export default function Life(locations = []) {
  return FromLiving(locations)
}

function Make(grid, store, recycledStore, ownerID) {
  let life = Object.create(Life.prototype)
  life.grid = grid
  life.store = store
  life.recycledStore = recycledStore
  life.__ownerID = ownerID
  life.__altered = false
  return life
}

function FromLiving(locations) {
  let store = Store()
    , grid = LetStore(store, () => G.FromLiving(locations))
  return Make(grid, store)
}

function Copy(life, ownerID) {
  let store = Store()
    , grid = LetStore(store, () => G.Copy(life.grid))
  return Make(grid, store, undefined, ownerID)
}

function Get(life, location) {
  return G.Get(life.grid, location)
}

function Set(life, location, state) {
  let store = Store()
    , grid = LetStore(store, () => G.Set(life.grid, [[location, state]]))
  return Make(grid, store)
}

Life.prototype.add = function(location) {
  return Set(this, location, true)
}

Life.prototype.has = function(location) {
  return Get(this, location)
}

Life.prototype.remove = function(location) {
  return Set(this, location, false)
}

Life.prototype.render = function(renderCfg) {
  let {imageData: imageDataAsU8Clamped, viewport, colors: colorsRGBA} = renderCfg
    , imageData = {
        data: new Int32Array(imageDataAsU8Clamped.data.buffer),
        width: imageDataAsU8Clamped.width,
        height: imageDataAsU8Clamped.height
      }
    , colors = {
        alive: RGBAToInt32(colorsRGBA.alive),
        dead:  RGBAToInt32(colorsRGBA.dead)
      }
    , scaleX = imageDataAsU8Clamped.width / viewport.width
    , scaleY = imageDataAsU8Clamped.height / viewport.height
  // if (scaleX !== scaleY)
  //   throw Error("Expected equal aspect ratios for imageData and viewport: " + JSON.stringify({
  //     imageData: {
  //       width: imageData.width,
  //       height: imageData.height,
  //       ratio: imageData.width / imageData.height
  //     },
  //     viewport: {
  //       width: viewport.width,
  //       height: viewport.height,
  //       ratio: viewport.width / viewport.height
  //     }
  //   }))
  G.Render(this.grid, {imageData, colors, viewport, scale: scaleX})  
  return imageDataAsU8Clamped
}
let RGBAToInt32 = rgba => new Int32Array(new Uint8ClampedArray(rgba).buffer)[0]

// count = 1, unique = false
function StepOncePure(life) {
  let nextStore = life.recycledStore ? life.recycledStore.Clear() : Store()
    , nextGrid = LetStore(nextStore, () => G.Next(life.grid))
  life.recycledStore = null // Moved to new owner (if present)
  return Make(nextGrid, nextStore)
}
// count  = 1, unique = true
function StepOnceMutate(life) {
  let nextStore = life.recycledStore ? life.recycledStore.Clear() : Store()
    , nextGrid = LetStore(nextStore, () => G.Next(life.grid))
  life.recycledStore = life.store // Mutate -> allow old store to be recycled
  life.grid = nextGrid
  life.store = nextStore
  return life
}

function StepManyPure(life, count) {
  var off = life.recycledStore || Store()
    , on = Store()
    , grid = life.grid
  for (let i = 0; i < count; i++) {
    [on, off] = [off, on]
    grid = LetStore(on.Clear(), () => G.Next(grid))
  }
  life.recycledStore = off
  return Make(grid, on)
}

function StepManyMutate(life, count) {
  var off = life.recycledStore || Store()
    , on = life.store
  for (let i = 0; i < count; i++) {
    [on, off] = [off, on]
    life.grid = LetStore(on.Clear(), () => G.Next(life.grid))
  }
  life.store = on
  life.recycledStore = off
  return life
}

Life.prototype.step = function({count = 1, canMutate} = {}) {
  let Step =
      (count === 1 && !canMutate) ? StepOncePure
    : (count === 1 &&  canMutate) ? StepOnceMutate
    : (count >   1 && !canMutate) ? StepManyPure
    : (count >   1 &&  canMutate) ? StepManyMutate
    : undefined
  return Step(this, count)
}

Life.prototype.values = function() {
  return G.Living(this.grid)
}

function OwnerID() {}

function setAltered(life) {
  life.__altered = true
  return life
}

Life.prototype.withMutations = function(fn) {
  let mutable = this.asMutable()
  fn(mutable)
  return mutable.wasAltered()
    ? mutable.__ensureOwner(this.__ownerID)
    : this
}

Life.prototype.asMutable = function() {
  return this.__ownerID
    ? this
    : this.__ensureOwner(new OwnerID())
}

Life.prototype.asImmutable = function() {
  return this.__ensureOwner()
}

Life.prototype.wasAltered = function() {
  return this.__altered
}

Life.prototype.__ensureOwner = function(ownerID) {
  if (ownerID === this.__ownerID)
    return this
  else if (!ownerID) {
    // `mutable.__ensureOwner()` -> change to immutable
    if (this.size === 0)
      return EMPTY
    else {
      this.__ownerID = ownerID
      this.__altered = false
      return this
    }
  }
  // make own copy
  else return copy(this, ownerID)
}

Life.BlurBuffer = function(opts) {
  let blurBuffer = G.BlurBuffer(opts)
    , wrappedBlurBuffer = {...opts, add, draw, clear, get: () => blurBuffer}
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