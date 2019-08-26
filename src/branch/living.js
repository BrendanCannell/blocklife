import QUADRANTS from "./quadrants"

export default ({Recur: Living}) =>
  function* BranchLiving(size, branch) {
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      for (let [x, y] of Living(size/2, branch[index]))
        yield [x + dx * size, y + dy * size]
  }