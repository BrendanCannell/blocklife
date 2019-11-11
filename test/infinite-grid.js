import {AscXGroupedByDescY as order} from "./util/location"
import Glider from "./util/glider"
import Store from "../src/canonical-store32"
import LetStore from "../src/let-store"
import * as G from "../src/infinite-grid"

export function testInfiniteGridNext(t) {
  for (let direction in Glider) {
    let store1 = Store()
      , store2 = Store()
      , offset = [0, 0]
      , stepCount = 24
      , glider = Glider[direction](-stepCount/2, offset)
      , grid = LetStore(store2, () => {
          let empty = G.FromLiving([])
          return G.Set(empty, glider.map(loc => [loc, true]))
        })
    for (let i = 0; i < stepCount; i++) {
      let store = i % 2 === 0 ? store1 : store2
      store.Clear()
      grid = LetStore(store, () => G.Next(grid))
    }
    let actual = [...G.Living(grid)].sort(order)
      , expected = Glider[direction](stepCount/2, offset)
    t.assert(actual == expected, 'move a glider across the origin')
    t.assert(actual.every(loc => G.Get(grid, loc)), 'move a glider across the origin')
  }
}