import QUADRANTS from "./quadrants"

let Add = ({Recur}) =>
  function BranchAdd(size, branch, bx, by, paddedViewport, offsetPerRow, blurData) {
    let {v0: [x0, y0], v1: [x1, y1]} = paddedViewport
      , qSize = size / 2
    for (let {index, offset: [dx, dy]} of QUADRANTS) {
      let quadrant = branch[index]
        , qx = bx + dx * size
        , qy = by + dy * size
        , overlapsViewport =
               qx + qSize > x0
            && qy + qSize > y0
            && qx < x1
            && qy < y1
      if (overlapsViewport)
        Recur(qSize, quadrant, qx, qy, paddedViewport, offsetPerRow, blurData)
    }
    return blurData
  }

export default {Add}