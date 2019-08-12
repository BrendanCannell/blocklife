import {_Get, SIZE} from "../leaf"
import {QUADRANTS} from "../branch"

export let Branch = ({Recur: Living}) =>
  function*(size, branch) {
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      for (let [x, y] of Living(size/2, branch[index]))
        yield [x + dx * size, y + dy * size]
  }

export let Leaf = () =>
  function*(_size, leaf) {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++)
        if (_Get(leaf, x, y) === true)
          yield [x, y]
  }