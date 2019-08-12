import {CheckBounds, _Get} from "../leaf"
import {QuadrantLocation} from "../branch"

export let Branch = ({Recur: Get}) =>
  function BranchGet(size, branch, loc) {
    let {index, location} = QuadrantLocation(loc, size)
    return Get(size/2, branch[index], location)
  }

export let Leaf = () =>
  function LeafGet(_size, leaf, [x, y]) {
    CheckBounds(x, y)
    return _Get(leaf, x, y)
  }