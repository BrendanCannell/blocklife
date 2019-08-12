import {Mutate, SIZE} from "../leaf.js"
import {QuadrantLocation} from "../branch.js"

export let Branch = ({Malloc, Recur: Set}) =>
  function SetBranch(size, branch, pairs) {
    let raw = Malloc(branch)
      , partitions = [[], [], [], []]
    for (let [loc, state] of pairs) {
      let {index, location} = QuadrantLocation(loc, size)
      partitions[index].push([location, state])
    }
    for (let i = 0; i < 4; i++)
      raw[i] =
        partitions[i].length === 0
          ? branch[i]
          : Set(size / 2, branch[i], partitions[i])
    return raw
  }

export let Leaf = ({Malloc}) => function SetLeaf(_size, leaf, pairs) {
  let raw = Malloc(leaf)
  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  for (let [loc, state] of pairs)
    Mutate(raw, loc, state)
  return raw
}