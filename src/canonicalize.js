// Opts -> (A -> Node) -> (A -> Node)

export let Canonicalize = ({Hash, Equal, SetDerived, Malloc, Free, GetCanon, SetCanon}) => Constructor => (...args) => {
  let node = Constructor(Malloc(), ...args)
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

export default Canonicalize