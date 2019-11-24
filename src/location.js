export let AscXGroupedByDescY = ([x0, y0], [x1, y1]) =>
  y0 !== y1 ? y0 - y1 : x0 - x1

let order = AscXGroupedByDescY

export let Equal = (l0, l1) =>
  order(l0, l1) === 0

export let EqualSet = (locs0, locs1) => {
  let l0 = [...locs0].sort(order)
    , l1 = [...locs1].sort(order)
  if (l0.length !== l1.length) return false
  let len = l0.length
  for (let i = 0; i < len; i++)
    if (!Equal(l0[i], l1[i])) return false
  return true
}

export let InBounds = size => ([x, y]) =>
  x >= 0 && x < size && y >= 0 && y < size

export let Randoms = (size, rng,
    {
      range = size,
      offset = 0,
      alive: aliveCount = 0,
      dead: deadCount = 0,
      outOfBounds = 0
    }) => {
  let bounded = n => n >= 0 && n <= size
    , good = () => {
        let n = range * rng() + offset | 0
        return bounded(n) ? n : good()
      }
    , bad = () => {
        let n = (rng() - 0.5) * Number.MAX_SAFE_INTEGER | 0
        return !bounded(n) ? n : bad()
      }
    , removeDuplicates = a => {
        a.sort(order)
        let deduped = [a[0]]
        for (let i = 1; i < a.length; i++)
          if (0 !== order(a[i], a[i - 1])) deduped.push(a[i])
        return deduped
      }
    , inBounds = []
  while (inBounds.length < aliveCount + deadCount) {
    while (inBounds.length < aliveCount + deadCount)
      inBounds.push([good(), good()])
    inBounds = removeDuplicates(inBounds)
  }
  let alive = inBounds.splice(0, aliveCount).sort(order)
    , dead  = inBounds.splice(aliveCount)   .sort(order)

  return {
    alive,
    dead,
    outOfBounds: [...Array(outOfBounds)].map((_, i) => 
         i % 3 === 0 && [good(), bad()]
      || i % 3 === 1 && [bad(), good()]
      || i % 3 === 2 && [bad(), bad()])
  }
}

export let Translate = ([dx, dy], locs) =>
  locs.map(([x, y]) => [x + dx, y + dy])