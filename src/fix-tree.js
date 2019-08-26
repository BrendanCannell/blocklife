// Tying the knot for a single grid function
export default LEAF_SIZE => function Fix({Leaf, Branch}) {
  let LeafCase = Leaf()
    , BranchCase = Branch({Recur: GridSwitch})
  function GridSwitch(size, ...rest) {
    let Case = size === LEAF_SIZE ? LeafCase : BranchCase
    return Case(size, ...rest) // TODO remove `size` in leaf case
  }
  return GridSwitch
}