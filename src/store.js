export let Copy = (from, copyObj = x => x) =>
  New(from.Malloc, from.pool.map(copyObj), from.next)

export let New = (Malloc, pool = [], next = 0) => ({
  Get: () => {
    if (next === pool.length) pool.push(Malloc())

    return pool[next++]
  },

  Clear: () => {
    let half = Math.ceil(pool.length / 2)

    if (next <= half) pool.splice(-half, half)
    
    next = 0
  },

  Free: obj => {
    if (pool.length === 0
        || pool[next - 1] !== obj)
      throw TypeError("Illegal use of Free")
    
    next--
  },

  Copy: (copyObj = x => x) =>
    New(Malloc, pool.map(copyObj), next),

  Malloc,
  pool,
  get next() {
    return next
  },
})