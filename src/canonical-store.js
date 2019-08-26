import * as U from "./util"
import Branch from "./branch/storable"
import Edge from "./edge/storable"
import Leaf from "./leaf32/storable"
import Neighborhood from "./neighborhood/storable"
let Substores = U.map(Substore)({Branch, Edge, Leaf, Neighborhood})
export default function Store() {
  let substores = U.map(S => S())(Substores)
    , Clear = () => U.forEach(S => S.Clear())(substores) && store
    , Show = () => U.map(S => S.Show())(substores)
    , store = {...substores, Clear, Show}
  return store
}

import S from "./substore"
function Substore(MallocCopy) {
  let Substore = S(MallocCopy)
  return function CanonicalSubstore(substore = Substore(), hashTable = new Map()) {
    return {
      Malloc: substore.Malloc,
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