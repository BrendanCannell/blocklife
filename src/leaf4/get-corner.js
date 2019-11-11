import * as D from "../direction"
import {NORTHWEST_CORNER, NORTHEAST_CORNER, SOUTHWEST_CORNER, SOUTHEAST_CORNER} from "./constants"

const CORNER_MASKS = [0,0,0,0]
CORNER_MASKS[D.NW] = NORTHWEST_CORNER
CORNER_MASKS[D.NE] = NORTHEAST_CORNER
CORNER_MASKS[D.SW] = SOUTHWEST_CORNER
CORNER_MASKS[D.SE] = SOUTHEAST_CORNER

export default function LeafGetCorner(leaf, direction) {
  return leaf & CORNER_MASKS[direction]
}