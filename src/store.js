export let Copy = (from, copyObj = x => x) =>
  New(from.Malloc, from.pool.map(copyObj), from.next)

export let New = (Malloc, pool = [], inUse = 0) => ({
  Malloc: () => {
    if (inUse === pool.length) pool.push(Malloc())

    return pool[inUse++]
  },

  Clear: () => {
    let half = Math.ceil(pool.length / 2)

    if (inUse <= half) pool.splice(-half, half)
    
    inUse = 0
  },

  Free: obj => {
    if (pool.length === 0
        || pool[inUse - 1] !== obj)
      throw TypeError("Illegal use of Free")
    
    inUse--
  },

  Copy: (copyObj = x => x) =>
    New(Malloc, pool.map(copyObj), inUse),
  
  Show: () => ({size: pool.length, next: inUse})
})