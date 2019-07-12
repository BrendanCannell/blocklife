// Uses Paul Hsieh's SuperFastHash algorithm

let ofArray = array => {
  let hash = array.length * 4

  for (let i = 0; i < array.length; i++) {
    hash = reducer(hash, array[i] | 0)
  }

  return finalize(hash)
}

let reducer = (hashAcc, n) => {
  hashAcc = hashAcc | 0

  let bits0_15  = n & 0x0000FFFF
  let bits16_31 = n & 0xFFFF0000
  
  let h1 = hashAcc + bits0_15 | 0
  let h2 = (bits16_31 >>> 5) ^ h1
  let h3 = (h1 << 16) ^ h2

  return h3 + (h3 >>> 11) | 0
}

let finalize = hashAcc => {
  let h = hashAcc | 0

  h = h ^ (h <<  3)
  h = h + (h >>> 5)  | 0
  h = h ^ (h <<  4)
  h = h + (h >>> 17) | 0
  h = h ^ (h <<  25)
  h = h + (h >>> 6)  | 0

  return h
}

export {ofArray, reducer, finalize}