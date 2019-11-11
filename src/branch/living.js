import QUADRANTS from "./quadrants"

export default ({Recur: Living}) =>
  function* BranchLiving(branch) {
    let size = branch.size
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      for (let [x, y] of Living(branch[index]))
        yield [x + dx * size, y + dy * size]
  }