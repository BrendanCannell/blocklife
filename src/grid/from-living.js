import {Mutate, SIZE} from "../leaf"
import {QuadrantLocation} from "../branch"

export let Branch = ({Malloc, Recur: FromLiving}) =>
  function BranchFromLiving(size, locations) {
    let raw = Malloc()
      , partitions = [[], [], [], []]
    for (let loc of locations) {
      let {index, location} = QuadrantLocation(loc, size)
      partitions[index].push(location)
    }
    for (let i = 0; i < 4; i++)
      raw[i] = FromLiving(size / 2, partitions[i])
    return raw
  }

export let Leaf = ({Malloc}) =>
  function LeafFromLiving(_, locations) {
    let raw = Malloc()
    for (let i = 0; i < SIZE; i++)
      raw[i] = 0
    for (let loc of locations)
      Mutate(raw, loc, true)
    return raw
  }