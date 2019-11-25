import * as U from "./util"

let MemoizeWithTable = memoTable => Fn => {
  if (Fn.name) U.setName(Memoized, 'Memoized' + Fn.name)
  return Memoized

  function Memoized(arg) {
    let memo = memoTable.get(arg)
    if (memo) return memo
    else {
      let result = Fn(arg)
      memoTable.set(arg, result)
      return result
    }
  }
}
export default MemoizeWithTable