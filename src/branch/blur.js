import QUADRANTS from "./quadrants"

let Add = ({Recur}) =>
  function BranchAdd(size, branch, branchOffset, blurData) {
    let {sizeCoefficient, offsetPerRow} = blurData
    for (let {index, offset: [dx, dy]} of QUADRANTS) { // TODO filter by bounds
      let quadrant = branch[index]
        , qSize = size / 2
        , qOffset = branchOffset + dx * size * sizeCoefficient + dy * size * offsetPerRow
      Recur(qSize, quadrant, qOffset, blurData)
    }
    return blurData
  }

export default {Add}