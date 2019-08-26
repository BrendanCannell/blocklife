export default ({Malloc, Recur: Copy}) =>
  function BranchCopy(size, branch) {
    let raw = Malloc()
    for (let i = 0; i < 4; i++)
      raw[i] = Copy(size/2, branch[i])
    return raw
  }