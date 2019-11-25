import {Test as L} from "./index"
import Glider from "../glider"
import {AscXGroupedByDescY as order} from "../location"

export function testNext(t) {
  // For each diagonal direction:
  // * Start a glider in the center of a single-leaf closed grid
  // * Iterate SIZE * 4 times
  // * Check that the glider has returned to its starting position 
  for (let direction in Glider) {
    let stepCount = L.SIZE * 4
    let glider = Glider[direction](0, [15, 15])
    let l = L.FromLiving(glider)
    for (let i = 0; i < stepCount; i++) {
      l = L.Next(l, l, l, l, l, l, l, l, l)
    }
    let actual = [...L.Living(l)].sort(order)
    let expected = glider
    t.assert(actual == expected)
  }
}