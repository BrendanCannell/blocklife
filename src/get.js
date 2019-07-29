import {CheckBounds, _Get} from "./leaf"
import {QuadrantLocation} from "./branch"

export let Leaf = (ctx, leaf, [x, y]) => {
  CheckBounds(x, y)

  return _Get(leaf, x, y)
}

export let Branch = ({Recur: Get}) =>
  (ctx, branch, loc) => {
    let {index, location} = QuadrantLocation(loc, branch.size)

    return Get(ctx, branch[index], location)
  }