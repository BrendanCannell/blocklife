import * as D from "../direction"
import {population as Population} from "../util"
import {SIZE, WEST_EDGE, EAST_EDGE} from "./constants"

export default function LeafSetDerived(leaf, hash) {
  leaf.hash = hash
  var west = 0
    , east = 0
    , population = 0
  for (let i = 0; i < SIZE; i++) {
    let row = leaf[i]
    west |= (row & WEST_EDGE) >>> i
    east |= (row & EAST_EDGE) <<  31 - i
    population += Population(row)
  }
  leaf.edges[D.N] = leaf[0]
  leaf.edges[D.S] = leaf[31]
  leaf.edges[D.W] = west
  leaf.edges[D.E] = east
  leaf.corners[D.NW] = west >>> 31
  leaf.corners[D.NE] = east >>> 31
  leaf.corners[D.SW] = west & 1
  leaf.corners[D.SE] = east & 1
  leaf.population = population

  return leaf
}