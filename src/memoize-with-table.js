let MemoizeWithTable = memoTable => Fn =>
  function Memoized(arg) {
    let memo = memoTable.get(arg)
    if (memo) return memo
    else {
      let result = Fn(arg)
      memoTable.set(arg, result)
      return result
    }
  }
  
export default MemoizeWithTable