export default ({Allocate}) =>
  function NewBranch(size, ...quadrants) {
    let raw = Allocate()
    raw.size = size
    for (let i = 0; i < 4; i++)
      raw[i] = quadrants[i]
    return raw
  }