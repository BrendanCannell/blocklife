import {order} from "./life"

export let InBounds = size => ([x, y]) => x >= 0 && x < size && y >= 0 && y < size

export let AllIndexes = size => [...Array(size).keys()]

export let AllLocations = size => {
  let idxs = AllIndexes(size)
  
  return idxs.flatMap(x => idxs.map(y => [x, y])).sort(order)
}

export let RandomLocations = (size, rng) => {
  let all = AllLocations(size)

  let alive = all.filter(() => rng() > 0.5).sort(order)

  let dead = all.filter(pair => !alive.includes(pair)).sort(order)

  let bad = () => {
    let n = (rng() - 0.5) * Number.MAX_SAFE_INTEGER | 0

    return n < 0 || n >= size ? n : bad()
  }

  let outOfBounds = alive.map(([x, y], i) => 
         i % 3 === 0 && [x,     bad()]
      || i % 3 === 1 && [bad(), y    ]
      || i % 3 === 2 && [bad(), bad()])

  return {all, alive, dead, outOfBounds}
}