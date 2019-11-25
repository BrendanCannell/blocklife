import * as G from "./infinite-grid32"
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
    , grid = LetStore(store, () => G.SetMany(life.grid(), pairs))
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

export function Remove(life, location) {
  return Set(life, location, false)
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

export function Step(life, opts) {
  let store = life.newStore()
    , grid = LetStore(store, () => G.Next(life.grid()))
    , recycledStore = Go(opts, 'canFree') && life.takeStore()
  return Make(grid, store, recycledStore)
}

export function Values(life) {
  return G.Living(life.grid())
}

function Go(obj, key) {
  return typeof obj === 'object' && obj[key]
}