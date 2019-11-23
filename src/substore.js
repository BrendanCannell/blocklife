let Substore = ({Allocate, Copy, Free}) => function New(pool = [], inUse = 0, cleared = false) {
  let store = {
    Allocate: () => {
      if (inUse === pool.length) pool.push(Allocate())
      cleared = false
      return pool[inUse++]
    },
    Clear: () => {
      let half = Math.ceil(pool.length / 2)
      if (!cleared && inUse <= half) pool.splice(-half, half)
      for (let obj of pool) Free(obj)
      cleared = true
      inUse = 0
      return store
    },
    Free: obj => {
      if (pool.length === 0 || pool[inUse - 1] !== obj)
        throw TypeError("Illegal use of Free")
      Free(obj)
      inUse--
      return store
    },
    Copy: ctx => New(pool.map(obj => Copy(ctx, obj)), inUse, cleared),
    Show: () => ({size: pool.length, next: inUse})
  }
  return store
}

export default Substore