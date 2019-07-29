import {CheckBounds, _Get} from "./leaf"
import {QuadrantLocation} from "./branch"

export let Leaf = (ctx, leaf, [x, y]) => {
  CheckBounds(x, y)

  return _Get(leaf, x, y)
}

export let Branch = ({Recur}) =>
  (ctx, branch, loc) => {
    let {index, location} = QuadrantLocation(loc, branch.size)

    return Recur(ctx, branch[index], location)
  }