import * as U from "../../src/util"
import {AscXGroupedByDescY as order, Translate} from "./location"

let gliders = (() => {
  let R = locs => locs.map(([x, y]) => [y,2-x])
    , T = Translate
    , G = ([dx, dy], SE) => U.map(ls => ls.sort(order))({
        NW: T([-dx, -dy], R(R(SE))),
        NE: T([ dy, -dx], R(SE)),
        SW: T([-dy,  dx], R(R(R(SE)))),
        SE: T([ dx,  dy], SE),
      })
  return U.zip([
    G([0,0], [[1,0],[2,1],[0,2],[1,2],[2,2]]),
    G([0,1], [[0,0],[2,0],[1,1],[2,1],[1,2]]),
    G([0,1], [[2,0],[0,1],[2,1],[1,2],[2,2]]),
    G([1,1], [[0,0],[1,1],[2,1],[0,2],[1,2]])
  ])
})()

let StepGliderFrom = (glider, direction) => (stepCount = 0, offset = [0, 0]) => {
  if (stepCount !== (stepCount | 0)) throw "Expected integer stepCount: " + stepCount
  let phase = ((stepCount % 4) + 4) % 4
    , d = Math.floor(stepCount / 4)
    , [dx, dy] = {
        NW: [-d, -d],
        NE: [ d, -d],
        SW: [-d,  d],
        SE: [ d,  d]
      }[direction]
    , [x, y] = offset
  return Translate([x + dx, y + dy], glider[phase])
}

let Glider = U.map(StepGliderFrom)(gliders)

export default Glider