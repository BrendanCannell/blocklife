import QuadrantLocation from "./quadrant-location"

export default ({Recur: Get}) =>
  function BranchGet(size, branch, loc) {
    let {index, location} = QuadrantLocation(loc, size)
    return Get(size/2, branch[index], location)
  }