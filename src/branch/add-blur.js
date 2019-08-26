import QUADRANTS from "./quadrants"

export default ({Recur}) =>
  function BranchAddBlur(size, blurBuffer, branch, x, y) {
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      Recur(size / 2, blurBuffer, branch[index], x + dx * size, y + dy * size)
  }