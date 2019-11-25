import {HASH} from "./constants"

export default function EdgeGetHash(edge) {
  return typeof edge === 'number' ? edge : edge[HASH]
}