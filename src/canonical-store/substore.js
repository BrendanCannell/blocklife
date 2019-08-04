import S from "../substore"

export default MallocCopy => {
  let Substore = S(MallocCopy)

  return function CanonicalSubstore() {
    let store = Substore()
    let hashTable = new Map()
    
    return {
      Malloc: store.Malloc,
      Free: store.Free,
      GetCanon: hash => hashTable.get(hash),
      SetCanon: (hash, node) => hashTable.set(hash, node),
      Clear: () => {store.Clear(); hashTable.clear()},
      Show: () => ({
        store: store.Show(),
        hashTable: hashTable.size
      })
    }
  }
}