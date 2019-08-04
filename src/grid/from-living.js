import {Mutate, SIZE} from "../leaf"
import {QuadrantLocation} from "../branch"

export let Leaf = function LeafFromLiving(ctx, _, locations) {
  let raw = ctx.Leaf.Malloc()

  for (let i = 0; i < SIZE; i++)
    raw[i] = 0

  for (let loc of locations)
    Mutate(raw, loc, true)

  return raw
}

export let Branch = ({Recur: FromLiving}) =>
  function BranchFromLiving(ctx, size, locations) {
    let raw = ctx.Branch.Malloc()
    raw.size = size

    // From live locations
    let partitions = [[], [], [], []]
      
    for (let loc of locations) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push(location)
    }

    for (let i = 0; i < 4; i++)
      raw[i] = FromLiving(ctx, size / 2, partitions[i])

    return raw
  }