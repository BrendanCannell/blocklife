import {SIZE} from "../leaf"
import {QUADRANTS} from "../branch"

export let Branch = ({Recur}) =>
  function BranchAdd(size, opts, branch, x, y) {
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      Recur(size / 2, opts, branch[index], x + dx * size, y + dy * size)
  }
  
export let Leaf = () =>
  function LeafAdd(_size, opts, leaf, x, y) {
    let {data, divisions, Offset, mask} = opts
    divisions = divisions | 0; mask = mask | 0;
    let base = Offset(x, y) | 0
    for (let y = 0; y < SIZE; y++) {
      let offset = base + y * divisions
      for (let d = 0; d < divisions; d++) {
        data[offset + d] += leaf[y] >>> d & mask
      }
    }
    return data
  }