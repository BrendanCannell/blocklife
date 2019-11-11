export default ({Malloc}) =>
  function NewBranch(size, ...quadrants) {
    let raw = Malloc()
    raw.size = size
    for (let i = 0; i < 4; i++)
      raw[i] = quadrants[i]
    return raw
  }