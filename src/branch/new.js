export default ({Allocate}) =>
  function NewBranch(size, ...quadrants) {
    let raw = Allocate()
    raw.size = size
    let mixedStores = false
    for (let i = 0; i < 4; i++) {
      raw[i] = quadrants[i]
      if (typeof quadrants[0] === 'object'
        && raw.storeGeneration !== quadrants[i].storeGeneration) {
          mixedStores = true
      }
    }
    if (mixedStores) {
      throw TypeError('Mixed stores: ', JSON.stringify(raw))
    }
    return raw
  }