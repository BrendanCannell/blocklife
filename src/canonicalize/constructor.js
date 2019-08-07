import * as U from "../util"

export default function MakeMakeCanonicalizingConstructor(typeName, c8izable) {
  let Canonicalize = MakeCanonicalize(typeName, c8izable)
  return function MakeCanonicalizingConstructor(Constructor) {
    let CanonicalizingConstructor = (ctx, ...args) => {
      return Canonicalize(ctx, Constructor(ctx, ...args))}
    if (Constructor.name)
      U.setName(CanonicalizingConstructor, 'Canonicalizing' + Constructor.name)
    return CanonicalizingConstructor
  }
}

function MakeCanonicalize(typeName, {Hash, Equal, SetDerived}) {
  return U.setName(Canonicalize, "Canonicalize" + typeName)
  function Canonicalize(ctx, newObj) {
    let {GetCanon, SetCanon, Free} = ctx[typeName]
      , hash = Hash(newObj)
      , bin = hash
    do {
      var canonical = GetCanon(bin)
      var collision = canonical && !Equal(newObj, canonical)
      if (collision) bin++
    } while (collision)
    if (!canonical) {
      SetCanon(bin, newObj)
      return SetDerived(ctx, newObj, hash)
    } else {
      Free(newObj)
      return canonical
    }
  }
}