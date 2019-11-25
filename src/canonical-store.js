import * as U from "./util"

export function ToMakeCanonicalStore(storables) {
  let storeGeneration = 0
  let MakeCanonicalSubstores = U.map(ToMakeCanonicalSubstore)(storables)
  return function Store() {
    let sg = storeGeneration++
      , substores = U.map(MCS => MCS(sg))(MakeCanonicalSubstores)
      , Clear = () => {
          for (let s in substores) substores[s].Clear()
          return store
        }
      , Show = () => U.map(S => S.Show())(substores)
      , store = {...substores, Clear, Show}
    return store
  }
}

import S from "./substore"
function ToMakeCanonicalSubstore(storable) {
  let MakeSubstore = S(storable)
  return function MakeCanonicalSubstore(storeGeneration, substore = MakeSubstore(), hashTable = new Map()) {
    return {
      Allocate: (...args) => {
        let obj = substore.Allocate(...args)
        obj.storeGeneration = storeGeneration
        return obj
      },
      Free: substore.Free,
      GetCanon: hash => {
        let canon = hashTable.get(hash)
        return canon
      },
      SetCanon: (hash, node) => hashTable.set(hash, node),
      Clear: () => substore.Clear() && hashTable.clear(),
      Show: () => ({
        store: substore.Show(),
        hashTable: hashTable.size
      }),
      Copy: () => MakeCanonicalSubstore(storeGeneration, substore.Copy(), new Map(hashTable))
    }
  }
}