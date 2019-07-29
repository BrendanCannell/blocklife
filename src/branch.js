import {Branch as AddTo} from "./add-to"
import {Branch as Copy} from "./copy"
import {Branch as Equal} from "./equal"
import {Branch as FromLiving} from "./from-living"
import {Branch as Get} from "./get"
import {Branch as Hash} from "./hash"
import {Branch as Living} from "./living"
import {Branch as Malloc} from "./malloc"
import {Branch as Next} from "./next"
import {Branch as Set} from "./set"
import {Branch as SetDerived} from "./set-derived"

export {AddTo, Copy, Equal, FromLiving, Get, Hash, Living, Malloc, Next, Set, SetDerived}

export const QUADRANTS = [
  {index: 0, offset: [0,   0]},
  {index: 1, offset: [0.5, 0]},
  {index: 2, offset: [0,   0.5]},
  {index: 3, offset: [0.5, 0.5]}
]

export let QuadrantLocation = (location, size) => {
  let {index, offset: [dx, dy]} = Quadrant(location, size)
  let [x, y] = location

  return {index, location: [x - dx * size, y - dy * size]}
}

// export let New = ({Malloc}) => (ctx, q0, q1, q2, q3) => {
//   let raw = Malloc(ctx)
//   raw.size = q0.size * 2

//   raw[0] = q0
//   raw[1] = q1
//   raw[2] = q2
//   raw[3] = q3

//   return raw
// }

let InBounds = (x, size) => 0 <= x && x < size

let Quadrant = ([x, y], size) => {
  for (let Q of QUADRANTS) {
    let [dx, dy] = Q.offset

    if (InBounds(x - dx * size, size / 2) && InBounds(y - dy * size, size / 2))
      return Q
  }

  throw TypeError(`Out of bounds: location = ${[x, y]}, size = ${size}`)
}