import {assert} from 'chai'
import {AscXGroupedByDescY as order} from "./util/location"
import Glider from "./util/glider"
import Store from "../src/canonical-store"
import {letStore} from "../src/let-store"
import * as R from "../src/root"

let offset = [-48, -48]
  , gliders = Glider.SE(0, offset)
  , store1 = Store()
  , store2 = Store()
  , stepCount = 4 * 200
  , expected = Glider.SE(stepCount, offset)

describe('Root', () => {
  it("Next(gliders) agrees with reference", () => {
    var grid = letStore(store2, () => {
      let empty = R.FromLiving([])
      return R.Set(empty, gliders.map(loc => [loc, true]))
    })
    for (let i = 0; i < stepCount; i++) {
      let store = i % 2 === 0 ? store1 : store2
      store.Clear()
      grid = letStore(store, () => R.Next(grid))
    }
    let actual = [...R.Living(grid)].sort(order)
    assert.deepEqual(actual, expected)
    assert.isTrue(actual.every(loc => R.Get(grid, loc)))
  })
})