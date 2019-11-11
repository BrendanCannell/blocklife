import QUADRANTS from "./quadrants"

let Render = ({Recur}) =>
  function BranchRender(branch, branchLeftGrid, branchTopGrid, renderCfg) {
    let size = branch.size
    for (let {index, offset: [dx, dy]} of QUADRANTS) {
      let quadrant = branch[index]
        , quadrantLeftGrid   = branchLeftGrid   + dx * size
        , quadrantTopGrid    = branchTopGrid    + dy * size
      Recur(quadrant, quadrantLeftGrid, quadrantTopGrid, renderCfg)
    }
  }

export default Render