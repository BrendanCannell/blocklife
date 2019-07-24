// Opts -> (A -> Node) -> (A -> Node)

({Hash, Equal, SetDerived, Malloc, Free, GetCanon, SetCanon}) => Node => (...args) => {
  let node = Node(Malloc(), ...args)
  let hash = Hash(node)
  let canon = GetCanon(hash)

  if (!canon) {
    SetCanon(hash, node)

    return SetDerived(node, hash)
  } else {
    if (!Equal(node, canon)) throw "Collision!"
  
    Free(node)

    return canon
  }
}