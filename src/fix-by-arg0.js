// Tying the knot for a single recursive function of tree size (Size, ...A) -> B
// * Inputs are branch and leaf cases.
// * The first argument is a tree `size`, and it is used for case dispatch.
export default LEAF_SIZE => function FixByArg0({Leaf, Branch}) {
  let LeafCase = Leaf
    , BranchCase = Branch({Recur: DispatchByArg0})
  function DispatchByArg0(size, ...rest) {
    if (size === LEAF_SIZE)
      return LeafCase(...rest)
    else
      return BranchCase(size, ...rest)
  }
  return DispatchByArg0
}