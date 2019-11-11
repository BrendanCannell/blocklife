import * as D from "../direction"
import {NORTH_EDGE, SOUTH_EDGE, WEST_EDGE, EAST_EDGE} from "./constants"

const EDGE_MASKS = [0,0,0,0]
EDGE_MASKS[D.N] = NORTH_EDGE
EDGE_MASKS[D.S] = SOUTH_EDGE
EDGE_MASKS[D.W] = WEST_EDGE
EDGE_MASKS[D.E] = EAST_EDGE

export default function LeafGetEdge(leaf, direction) {
  return leaf & EDGE_MASKS[direction]
}