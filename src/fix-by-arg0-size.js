// Tying the knot for a single recursive function of a tree (Tree, ...A) -> B
// * Inputs are branch and leaf cases.
// * The first argument is a tree node, and its `size` property is used for case dispatch.
export default LEAF_SIZE => function FixByArg0Size(cases) {
  let {Leaf, Branch} = cases
  Branch = Branch({Recur: DispatchByArg0Size})
  function DispatchByArg0Size(node, ...rest) {
    let Case = node.size === LEAF_SIZE ? Leaf : Branch
    return Case(node, ...rest)
  }
  return DispatchByArg0Size
}