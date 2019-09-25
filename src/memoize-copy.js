let MemoizeCopy = ({GetOriginal, MemoTable}) => Copy =>
  function MemoizedCopy(...args) {
    let {GetMemo, SetMemo} = MemoTable()
      , original = GetOriginal(...args)
      , memo = GetMemo(original)
    if (memo)
      return memo //(memo.length === 3 && console.log("memo")) || memo
    else {
      let copy = Copy(...args)
      SetMemo(original, copy)
      return copy
    }
  }

// Problem: `canonical` is a copy, so it won't be === to `original`
// We can supply a dynamic memo table that will associate originals with copies
// The memoized `Copy` must still be canonicalized.

// let MemoizeCopy = ({GetOriginal, GetHash, Equal, Canon}) => Copy => function MemoizedCopy(...args) {
//   let {GetCanon, SetCanon} = Canon()
//     , original = GetOriginal(...args)
//     , hash = GetHash(original)
//     , bin = hash
//   do {
//     var canonical = GetCanon(bin)
//     var collision = canonical && !Equal(original, canonical)
//     if (collision) bin++
//   } while (collision)
//   if (!canonical) {
//     let copy = Copy(...args)
//     SetCanon(bin, copy)
//     return copy
//   } else return canonical
// }
export default MemoizeCopy