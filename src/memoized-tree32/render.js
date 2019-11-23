import Branch from "./branch"
import Leaf from "./leaf"
let Render = (() => {
  let LEAF_SIZE = Leaf.SIZE
  let LeafCase = Leaf.Render()
  let BranchCase = Branch.Render({Recur: NodeSwitch})
  return NodeSwitch

  function NodeSwitch(node, left, top, renderCfg) {
    let v = renderCfg.viewport
      , size = node.size
      , right  = left + size
      , bottom = top  + size
      , overlapsViewport =
             left   < v.right
          && right  > v.left
          && top    < v.bottom
          && bottom > v.top
    if (!overlapsViewport || node.population === 0) return
    let Case = size === LEAF_SIZE ? LeafCase : BranchCase
    return Case(node, left, top, renderCfg)
  }
})()

export default Render