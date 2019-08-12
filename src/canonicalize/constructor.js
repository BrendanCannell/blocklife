import * as U from "../util"

export default function MakeMakeCanonicalizingConstructor(typeName, c8izable, Canon) {
  let Canonicalize = MakeCanonicalize(typeName, c8izable, Canon)
  return function MakeCanonicalizingConstructor(Constructor) {
    let CanonicalizingConstructor = (...args) =>
      Canonicalize(Constructor(...args))
    if (Constructor.name)
      U.setName(CanonicalizingConstructor, 'Canonicalizing' + Constructor.name)
    return CanonicalizingConstructor
  }
}

function MakeCanonicalize(typeName, {Hash, Equal, SetDerived}, Canon) {
  return U.setName(Canonicalize, "Canonicalize" + typeName)
  function Canonicalize(newObj) {
    let {GetCanon, SetCanon, Free} = Canon()
      , hash = Hash(newObj)
      , bin = hash
    do {
      var canonical = GetCanon(bin)
      var collision = canonical && !Equal(newObj, canonical)
      if (collision) bin++
    } while (collision)
    if (!canonical) {
      SetCanon(bin, newObj)
      return SetDerived(newObj, hash)
    } else {
      Free(newObj)
      return canonical
    }
  }
}