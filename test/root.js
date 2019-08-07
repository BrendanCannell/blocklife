import {assert} from 'chai'
import {AscXGroupedByDescY as order} from "./util/location"
import Glider from "./util/glider"

import Store from "../src/canonical-store"
import * as R from "../src/root"

let offset = [-48, -48]
let gliders = Glider.SE(0, offset)

describe('Root', () => {
  it("Next(gliders) agrees with reference", () => {
    let store1 = Store(), store2 = Store()
    let stepCount = 4 * 200
    let reference = Glider.SE(stepCount, offset)
    var grid = R.FromLiving(store1, gliders)
    for (let i = 0; i < stepCount; i++) {
      store2.Clear()
      grid = R.Next(store2, grid)
      let tmp = store2
      store2 = store1
      store1 = tmp
    }
    assert.deepEqual([...R.Living(store1, grid)].sort(order), reference)
  })
})