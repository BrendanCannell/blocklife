import {Mutate, SIZE} from "./leaf.js"
import {QuadrantLocation} from "./branch.js"

export let Leaf = ({Malloc}) => (ctx, leaf, pairs) => {
  let raw = Malloc(ctx)

  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  for (let [loc, state] of pairs)
    Mutate(raw, loc, state)

  return raw
}

export let Branch = ({Recur, Malloc}) =>
  (ctx, branch, pairs) => {
    let {size} = branch

    let raw = Malloc(ctx)
    raw.size = size

    let partitions = [[], [], [], []]
  
    for (let [loc, state] of pairs) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push([location, state])
    }

    for (let i = 0; i < 4; i++)
      raw[i] =
        partitions[i].length === 0
          ? branch[i]
          : Recur(ctx, branch[i], partitions[i])

    return raw
  }