import {Mutate, SIZE} from "./leaf"
import {QuadrantLocation} from "./branch"

export let Leaf = ({Malloc}) => (ctx, locations) => {
  let raw = Malloc(ctx)

  for (let i = 0; i < SIZE; i++)
    raw[i] = 0

  for (let loc of locations)
    Mutate(raw, loc, true)

  return raw
}

export let Branch = ({Recur, Malloc}) =>
  (ctx, locations, size) => {
    let raw = Malloc(ctx)
    raw.size = size

    // From live locations
    let partitions = [[], [], [], []]
      
    for (let loc of locations) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push(location)
    }

    for (let i = 0; i < 4; i++)
      raw[i] = Recur(ctx, partitions[i], size / 2)

    return raw
  }