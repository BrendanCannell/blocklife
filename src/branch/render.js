import QUADRANTS from "./quadrants"

let Render = ({Recur}) =>
  function BranchRender(size, branch, branchLeftGrid, branchTopGrid, renderCfg) {
    let qSize = branch.size / 2
    for (let {index, offset: [dx, dy]} of QUADRANTS) {
      let quadrant = branch[index]
        , quadrantLeftGrid   = branchLeftGrid   + dx * branch.size
        , quadrantTopGrid    = branchTopGrid    + dy * branch.size
      Recur(qSize, quadrant, quadrantLeftGrid, quadrantTopGrid, renderCfg)
    }
  }

export default Render