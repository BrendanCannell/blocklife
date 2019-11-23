import * as U from "./util"

export default function MakeMakeCanonicalConstructor(c8izable, Canon) {
  let Canonicalize = MakeCanonicalize(c8izable, Canon)
  return function MakeCanonicalConstructor(Constructor) {
    let CanonicalConstructor = (...args) =>
      Canonicalize(Constructor(...args))
    if (Constructor.name)
      U.setName(CanonicalConstructor, 'Canonical' + Constructor.name)
    return CanonicalConstructor
  }
}

function MakeCanonicalize({Hash, Equal, SetDerived}, Canon) {
  return function Canonicalize(newObj) {
    let {GetCanon, SetCanon, Free} = Canon()
      , hash = Hash(newObj)
      , bin = hash
    do {
      var canonical = GetCanon(bin)
      var collision = canonical && !Equal(newObj, canonical)
      if (collision) {
        console.log(`COLLISION: ${bin}\n`, {newObj, canonical})
        bin++
      }
    } while (collision)
    if (!canonical) {
      SetDerived(newObj, hash)
      SetCanon(bin, newObj)
      return newObj
    } else {
      Free(newObj)
      return canonical
    }
  }
}