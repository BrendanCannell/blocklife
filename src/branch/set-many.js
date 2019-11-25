import QuadrantLocation from "./quadrant-location"

export default ({Allocate, Recur: SetMany}) =>
  function BranchSetMany(branch, pairs) {
    let raw = Allocate(branch)
      , size = branch.size
      , partitions = [[], [], [], []]
    raw.size = size
    for (let [loc, state] of pairs) {
      let {index, location} = QuadrantLocation(loc, size)
      partitions[index].push([location, state])
    }
    for (let i = 0; i < 4; i++)
      raw[i] = SetMany(branch[i], partitions[i])
    return raw
  }