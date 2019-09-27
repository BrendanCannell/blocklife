// Tying the knot for a single grid function
export default LEAF_SIZE => function FixByNode({Leaf, Branch}) {
  let LeafCase = Leaf()
    , BranchCase = Branch({Recur: GridSwitch})
  function GridSwitch(node, ...rest) {
    let Case = node.size === LEAF_SIZE ? LeafCase : BranchCase
    return Case(node, ...rest) // TODO remove `size` in leaf case
  }
  return GridSwitch
}