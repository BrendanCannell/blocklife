import QuadrantLocation from "./quadrant-location"

export default ({Recur: Get}) =>
  function BranchGet(branch, loc) {
    let {index, location} = QuadrantLocation(loc, branch.size)
    return Get(branch[index], location)
  }