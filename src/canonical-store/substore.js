import S from "../substore"

export default MallocCopy => {
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