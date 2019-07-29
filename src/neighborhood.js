import * as D from "./direction"
import {Neighborhood as Equal} from "./equal"
import {Neighborhood as Hash} from "./hash"
import {Neighborhood as Malloc} from "./malloc"
import {Neighborhood as SetDerived} from "./set-derived"

export {Equal, Hash, Malloc, SetDerived}

export let New = ({Malloc}) => (
      ctx,
      node,
      N, S, W, E,
      NW, NE, SW, SE
    ) => {
  let raw = Malloc(ctx)
  raw.node = node
  
  raw.edges[D.N] = N.edges[D.N]
  raw.edges[D.S] = S.edges[D.S]
  raw.edges[D.W] = W.edges[D.E]
  raw.edges[D.E] = E.edges[D.W]

  raw.corners[D.NW] = NW.corners[D.SE]
  raw.corners[D.NE] = NE.corners[D.SW]
  raw.corners[D.SW] = SW.corners[D.NE]
  raw.corners[D.SE] = SE.corners[D.NW]

  return raw
}