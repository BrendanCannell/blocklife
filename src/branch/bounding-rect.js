import QUADRANTS from "./quadrants"

let BoundingRect = ({Recur: BoundingRect}) =>
  function BranchBoundingRect(branch, branchLeft, branchTop, boundingRect) {
    if (branch.population === 0) return boundingRect
    let size = branch.size
    for (let {index, offset: [dx, dy]} of QUADRANTS) {
      let quadrant = branch[index]
        , quadrantLeft = branchLeft + dx * size
        , quadrantTop  = branchTop  + dy * size
        , quadrantRight  = quadrantLeft + size/2
        , quadrantBottom = quadrantTop  + size/2
      if (
           boundingRect.top  <= quadrantTop  && quadrantBottom < boundingRect.bottom
        && boundingRect.left <= quadrantLeft && quadrantRight  < boundingRect.right
      ) continue;
      boundingRect = BoundingRect(quadrant, quadrantLeft, quadrantTop, boundingRect)
    }
    return boundingRect
  }

export default BoundingRect