import * as S from "./store"
import {map, pick} from "./util"

export let Substore = Malloc => {
  let store = S.New(Malloc)
  let hashTable = new Map()

  return {
    ...pick(['Malloc', 'Free'])(store),
    GetCanon: hash => hashTable.get(hash),
    SetCanon: (hash, node) => hashTable.set(hash, node),
    Clear: () => (store.Clear(), hashTable.clear()),
    Show: () => ({
      store: store.Show(),
      hashTable: hashTable.size
    })
  }
}

export let New = map(({Malloc}) => Substore(Malloc))

export default New