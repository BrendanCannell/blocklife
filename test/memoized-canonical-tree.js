import {AscXGroupedByDescY as order} from "./util/location"
import Glider from "./util/glider"
import Store from "../src/canonical-store"
import LetStore from "../src/let-store"
import T from "../src/memoized-canonical-tree"

let testDirection = direction => t => {
  let size = 64
    , offset = [32, 32]
    , stepCount = size * 2
    , glider = Glider[direction](-stepCount/2, offset)
    , stores = [Store(), Store()]
    , {grid, e} = LetStore(stores[1], () => {
        let empty = T.FromLiving(size, [])
        return {
          grid: T.Set(size, empty, glider.map(loc => [loc, true])),
          e: empty
        }
      })
  t.assert(glider.every(loc => T.Get(size, grid, loc)), 'set/get')
  for (let i = 0; i < stepCount; i++) {
    let store = stores[i % 2]
    store.Clear()
    LetStore(store, () => {
      grid = T.Next(size, grid, e, e, e, e, e, e, e, e),
      e = T.FromLiving(size, [])
    })
  }
  let actual = [...T.Living(size, grid)].sort(order)
    , expected = Glider[direction](stepCount/2, offset)
  t.assert(actual == expected, 'move a glider across the origin')
  t.assert(actual.every(loc => T.Get(size, grid, loc)), 'move a glider across the origin')
}

export let testNW = testDirection('NW')
export let testNE = testDirection('NE')
export let testSW = testDirection('SW')
export let testSE = testDirection('SE')