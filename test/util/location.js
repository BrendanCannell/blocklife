import {order} from "./life"

export let InBounds = size => ([x, y]) => x >= 0 && x < size && y >= 0 && y < size

export let Randoms = (size, rng,
    {
      range = size,
      offset = 0,
      alive: aliveCount = 0,
      dead: deadCount = 0,
      outOfBounds = 0
    }) => {
  let bounded = n => n >= 0 && n <= size

  let good = () => {
    let n = range * rng() + offset | 0
  
    return bounded(n) ? n : good()
  }

  let bad = () => {
    let n = (rng() - 0.5) * Number.MAX_SAFE_INTEGER | 0

    return !bounded(n) ? n : bad()
  }

  let order = AscXGroupedByDescY

  let removeDuplicates = a => {
    a.sort(order)

    let deduped = [a[0]]

    for (let i = 1; i < a.length; i++)
      if (0 !== order(a[i], a[i - 1])) deduped.push(a[i])
    
    return deduped
  }

  let inBounds = []
  while (inBounds.length < aliveCount + deadCount) {
    while (inBounds.length < aliveCount + deadCount)
      inBounds.push([good(), good()])
    
    inBounds = removeDuplicates(inBounds)
  }

  let alive = inBounds.splice(0, aliveCount).sort(order)

  let dead = inBounds.splice(aliveCount).sort(order)

  return {
    alive,
    dead,
    outOfBounds: [...Array(outOfBounds)].map((_, i) => 
         i % 3 === 0 && [good(), bad()]
      || i % 3 === 1 && [bad(), good()]
      || i % 3 === 2 && [bad(), bad()])
  }
}