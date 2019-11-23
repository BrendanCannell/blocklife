import * as U from "./util"

export default Storables => {
  let storeGeneration = 0
  let MakeCanonicalSubstores = U.map(ToMakeCanonicalSubstore)(Storables)
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
function ToMakeCanonicalSubstore(Storable) {
  let MakeSubstore = S(Storable)
  return function MakeCanonicalSubstore(storeGeneration, substore = MakeSubstore(), hashTable = new Map()) {
    return {
      Allocate: (...args) => {
        let obj = substore.Allocate(...args)
        obj.storeGeneration = storeGeneration
        return obj
      },
      Free: substore.Free,
      GetCanon: hash => hashTable.get(hash),
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