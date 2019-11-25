import * as U from "./util"

export default function MakeMakeCanonicalizingConstructor(canonicalizable, Canon) {
  let Canonicalize = MakeCanonicalizer(canonicalizable, Canon)
  return function MakeCanonicalizingConstructor(Constructor) {
    let CanonicalizingConstructor = (...args) => Canonicalize(Constructor(...args))
    if (Constructor.name)
      U.setName(CanonicalizingConstructor, 'Canonicalized' + Constructor.name)
    return CanonicalizingConstructor
  }
}

// Canonicalization:
// * Hash the value and check if a value with that hash exists in the canonical store (checking for collisions)
// * If a canonical copy exists:
// *   Free the new, non-canonical copy
// *   Return the canonical copy
// * Else:
// *   Generate any derived data for the result
// *   Set the canonical store to map the hash to the result
// *   Return the result

function MakeCanonicalizer({Hash, Equal, SetDerived}, Canon) {
  return function Canonicalize(newObj) {
    let {GetCanon, SetCanon, Free} = Canon()
    var bin = Hash(newObj)
    var canonical = GetCanon(bin)
    while (canonical && !Equal(newObj, canonical)) {
      console.error(`COLLISION: ${bin}\n`, {newObj, canonical})
      canonical = GetCanon(++bin)
    }
    if (canonical) Free(newObj)
    else {
      SetDerived(newObj, bin)
      SetCanon(bin, newObj)
      canonical = newObj
    }
    return canonical
  }
}