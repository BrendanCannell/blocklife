import * as U from "../../src/util"
import {AscXGroupedByDescY as order, Translate} from "./location"

let glider = U.map(locs => locs.sort(order))({
  NW: [[0,0],[1,0],[2,0],[0,1],[1,2]],
  NE: [[1,0],[2,0],[0,1],[2,1],[2,2]],
  SW: [[0,0],[0,1],[2,1],[0,2],[1,2]],
  SE: [[1,0],[2,1],[0,2],[1,2],[2,2]]
})

let StepGliderFrom = (glider, direction) => (stepCount = 0, offset = [0, 0]) => {
  if (stepCount % 4 !== 0) throw Error("Expected multiple of 4 for step count: " + stepCount)
  let d = stepCount / 4
    , [dx, dy] = {
        NW: [-d, -d],
        NE: [d,  -d],
        SW: [-d,  d],
        SE: [d,   d]
      }[direction]
    , [x, y] = offset
  
  return Translate([x + dx, y + dy], glider)
}

let Glider = U.map(StepGliderFrom)(glider)

export default Glider