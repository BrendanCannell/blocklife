import * as U from "./util"

export default Storables => {
  let Substores = U.map(Substore)(Storables)
  return function Store() {
    let substores = U.map(S => S())(Substores)
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
function Substore(MallocCopy) {
  let Substore = S(MallocCopy)
  return function CanonicalSubstore(substore = Substore(), hashTable = new Map()) {
    let id = Math.random()
    return {
      Malloc: (...args) => {
        let obj = substore.Malloc(...args)
        obj.storeId = id
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
      Copy: () => CanonicalSubstore(substore.Copy(), new Map(hashTable))
    }
  }
}