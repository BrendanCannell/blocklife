export default ({Malloc, Recur: Copy, EdgeCopy}) => {
  return function BranchCopy(branch) {
    let raw = Malloc()
    for (let i = 0; i < 4; i++)
      raw[i] = Copy(branch[i])
    raw.size = branch.size
    raw.hash = branch.hash
    CopyDerived(branch, raw)
    return raw
  }

  function CopyDerived(original, copy) {
    copy.population = original.population
    let ce = copy.edges
      , cc = copy.corners
      , oe = original.edges
      , oc = original.corners
    for (let i = 0; i < 4; i++) {
      cc[i] = oc[i]
      ce[i] = EdgeCopy(oe[i])
    }
  }
}