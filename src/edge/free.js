import {HASH} from "./constants"

export default function EdgeFree(edge) {
  edge[HASH] = NaN
  return edge
}