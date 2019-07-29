import * as D from "./direction"
import {Edge as Equal} from "./equal"
import {Edge as Hash} from "./hash"
import {Edge as Malloc} from "./malloc"
import {Edge as SetDerived} from "./set-derived"

export {Equal, Hash, Malloc, SetDerived}

export const N = 0
export const S = 1
export const W = 0
export const E = 1

const sourceQuadrants = [
  [D.NW, D.NE],
  [D.SW, D.SE],
  [D.NW, D.SW],
  [D.NE, D.SE]
]

export let New = ({Malloc}) => (ctx, side, quadrants) => {
  let raw = Malloc(ctx)
  let [q0, q1] = sourceQuadrants[side]

  raw[0] = quadrants[q0].edges[side]
  raw[1] = quadrants[q1].edges[side]

  return raw
}