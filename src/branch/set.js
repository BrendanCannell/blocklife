import QuadrantLocation from "./quadrant-location"

export default ({Malloc, Recur: Set}) =>
  function BranchSet(size, branch, pairs) {
    let raw = Malloc(branch)
      , partitions = [[], [], [], []]
    raw.size = branch.size
    for (let [loc, state] of pairs) {
      let {index, location} = QuadrantLocation(loc, branch.size)
      partitions[index].push([location, state])
    }
    for (let i = 0; i < 4; i++)
      raw[i] =
        partitions[i].length === 0
          ? branch[i]
          : Set(branch.size / 2, branch[i], partitions[i])
    return raw
  }