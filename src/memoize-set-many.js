import * as U from "./util"

let ToMemoizeSetMany = memoTable => SetMany => {
  if (SetMany.name) U.setName(MemoizedSetMany, 'Memoized' + SetMany.name)
  return MemoizedSetMany

  function MemoizedSetMany(node, pairs) {
    if (pairs.length !== 0) return SetMany(node, pairs)
    let memo = memoTable.get(node)
    if (memo) return memo
    else {
      let result = SetMany(node, pairs)
      memoTable.set(node, result)
      return result
    }
  }
}
export default ToMemoizeSetMany