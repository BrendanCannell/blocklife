let Substore = ({Malloc, Copy}) => function New(pool = [], inUse = 0) {
  return {
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
      if (pool.length === 0 || pool[inUse - 1] !== obj)
        throw TypeError("Illegal use of Free")
      inUse--
    },
    Copy: ctx => New(pool.map(obj => Copy(ctx, obj)), inUse),
    Show: () => ({size: pool.length, next: inUse})
  }
}

export default Substore