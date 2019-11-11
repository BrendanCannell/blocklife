let MemoizeCopy = ({MemoTable}) => Copy =>
  function MemoizedCopy(original) {
    let {GetMemo, SetMemo} = MemoTable()
      , memo = GetMemo(original)
    if (memo)
      return memo
    else {
      let copy = Copy(original)
      SetMemo(original, copy)
      return copy
    }
  }
  
export default MemoizeCopy