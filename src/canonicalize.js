// Opts -> (A -> Node) -> (A -> Node)

export let Canonicalize = ({Hash, Equal, SetDerived}, toStore) => {
  let Free = (ctx, branch) => toStore(ctx).Free(branch)
  let GetCanon = (ctx, hash) => toStore(ctx).GetCanon(hash)
  let SetCanon = (ctx, hash, branch) => toStore(ctx).SetCanon(hash, branch) 
  
  return function Canonicalize(ctx, fresh) {
    let hash = Hash(fresh)
    var hashplus = hash
    var canonical = GetCanon(ctx, hashplus)
    while (canonical && !Equal(ctx, fresh, canonical)) {
      console.error("COLLISION")
      canonical = GetCanon(ctx, ++hashplus)
    }
    if (!canonical) {
      SetCanon(ctx, hashplus, fresh)
      return SetDerived(ctx, fresh, hash)
    } else {
      Free(ctx, fresh)
      return canonical
    }
  }
}

export default Canonicalize