import {HASH} from "./constants"

export default function EdgeHash(edge) {
  return typeof edge === 'number' ? edge : edge[HASH]
}