export default LEAF_SIZE => function DispatchByArg0Size(cases) {
  let {Branch, Leaf} = cases
  return (node, ...rest) => node.size === LEAF_SIZE
    ? Leaf  (node, ...rest)
    : Branch(node, ...rest)
}