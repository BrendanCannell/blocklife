// Opts -> (A -> Node) -> (A -> Node)

export let Canonicalize = ({Hash, Equal, SetDerived, Malloc, Free, GetCanon, SetCanon}) => Constructor => (...args) => {
  let fresh = Constructor(Malloc(), ...args)
  let hash = Hash(fresh)

  var hashplus = hash

  var canonical = GetCanon(hashplus)
  while (canonical && !Equal(fresh, canonical)) {
    console.error("COLLISION")
    canonical = GetCanon(++hashplus)
  }

  if (!canonical) {
    SetCanon(hashplus, fresh)

    return SetDerived(fresh, hash)
  } else {
    Free(fresh)

    return canonical
  }
}

export let WithCtx = ({Hash, Equal, SetDerived, Free, GetCanon, SetCanon}) => Constructor => (ctx, ...args) => {
  let fresh = Constructor(ctx, ...args)
  let hash = Hash(fresh)

  var hashplus = hash

  var canonical = GetCanon(ctx, hashplus)
  while (canonical && !Equal(fresh, canonical)) {
    console.error("COLLISION")
    canonical = GetCanon(ctx, ++hashplus)
  }

  if (!canonical) {
    SetCanon(ctx, hashplus, fresh)

    return SetDerived(fresh, hash)
  } else {
    Free(ctx, fresh)

    return canonical
  }
}

export default Canonicalize