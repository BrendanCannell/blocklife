import {_Get, SIZE} from "../leaf"
import {QUADRANTS} from "../branch"

export let Leaf = function*(ctx, leaf) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (_Get(leaf, x, y) === true)
        yield [x, y]
}

export let Branch = ({Recur: Living}) =>
  function*(ctx, branch) {
    let {size} = branch

    for (let {index, offset: [dx, dy]} of QUADRANTS)
      for (let [x, y] of Living(ctx, branch[index]))
        yield [x + dx * size, y + dy * size]
  }