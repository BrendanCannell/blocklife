import * as G from "./infinite-grid"
import Store from "./canonical-store32"
import LetStore from "./let-store"

function Make(grid, store, recycledStore) {
  let revocable = fn => (...args) => {
    if (!store) throw TypeError("Cannot use revoked life reference")
    return fn(...args)
  }
  return {
    grid: revocable(() => grid),
    store: revocable(() => store),
    takeStore: revocable(() => {
      let s = store.Clear()
      store = null
      return s
    }),
    newStore: revocable(() => {
      let rs = recycledStore ? recycledStore.Clear() : Store()
      recycledStore = null
      return rs
    }),
    hash: G.GetHash(grid)
  }
}

export function Empty() {
  return FromLiving([])
}

export function FromLiving(locations) {
  let store = Store()
    , grid = LetStore(store, () => G.FromLiving(locations))
  return Make(grid, store)
}

export function Copy(life, opts) {
  let store = life.newStore()
    , grid = LetStore(store, () => G.Copy(life.grid()))
    , recycledStore =  Go(opts, 'canFree') && life.takeStore()
  return Make(grid, store, recycledStore)
}

export function Get(life, location) {
  return G.Get(life.grid(), location)
}

export function Set(life, location, state, opts) {
  return SetMany(life, [[location, state]], opts)
}

export function SetMany(life, pairs, opts) {
  let store = life.newStore()
    , grid = LetStore(store, () => G.Set(life.grid(), pairs))
    , recycledStore = Go(opts, 'canFree') && life.takeStore()
  return Make(grid, store, recycledStore)
}

export function Add(life, location) {
  return Set(life, location, true)
}

export function BoundingRect(life) {
  return G.BoundingRect(life.grid())
}

export let Has = Get

export function Hash(life) {
  return G.GetHash(life.grid())
}

export function Population(life) {
  return G.GetPopulation(life.grid())
}

Life.prototype.hash = function() {
  return G.GetHash(this.grid)
}

Life.prototype.population = function() {
  return G.GetPopulation(this.grid)
}

Life.prototype.remove = function(location) {
  return Set(this, location, false)
}

export function Render(life, renderCfg) {
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
    , scale = Math.min(scaleX, scaleY)
  G.Render(life.grid(), {imageData, colors, viewport, scale})  
  return imageDataAsU8Clamped
}
let RGBAToInt32 = rgba => new Int32Array(new Uint8ClampedArray(rgba).buffer)[0]

// count = 1, canFree = false
function StepOncePure(life) {
  let nextStore = life.recycledStore ? life.recycledStore.Clear() : Store()
    , nextGrid = LetStore(nextStore, () => G.Next(life.grid))
  life.recycledStore = null // Moved to new owner (if present)
  return Make(nextGrid, nextStore)
}
// count = 1, canFree = true
function StepOnceMutate(life) {
  let nextStore = life.recycledStore ? life.recycledStore.Clear() : Store()
    , nextGrid = LetStore(nextStore, () => G.Next(life.grid))
  life.recycledStore = life.store // Mutate -> allow old store to be recycled
  life.grid = nextGrid
  life.store = nextStore
  return life
}
// count > 1, canFree = false
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

export function Values(life) {
  return G.Living(life.grid())
}

Life.prototype.step = function({count = 1, canFree} = {}) {
  if (count === 0) return this
  let Step =
      (count === 1 && !canFree) ? StepOncePure
    : (count === 1 &&  canFree) ? StepOnceMutate
    : (count >   1 && !canFree) ? StepManyPure
    : (count >   1 &&  canFree) ? StepManyMutate
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