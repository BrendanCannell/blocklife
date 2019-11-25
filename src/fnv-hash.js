// Fowler–Noll–Vo hash function for 32 bits
// Several variations are provided for best performance

const FNV_PRIME = 16777619
const FNV_OFFSET_BASIS = 2166136261

// (...[Number]) -> Hash
// Used to avoid allocating an array
export function of() {
  let len = arguments.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++) {
    let n = arguments[i] | 0
    for (let j = 0; j < 4; j++) {
      hash *= FNV_PRIME
      hash |= 0
      hash ^= n & 0xFF
      n >>>= 8
    }
  }

  return checkNaN(hash)
}

// [Number] -> Hash
export function ofArray(array) {
  let len = array.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++) {
    let n = array[i] | 0
    for (let j = 0; j < 4; j++) {
      hash *= FNV_PRIME
      hash |= 0
      hash ^= n & 0xFF
      n >>>= 8
    }
  }

  return checkNaN(hash)
}

// ([A], A -> Number) -> Hash
// ofArrayBy(array, GetHash) === ofArray(array.map(GetHash))
export function ofArrayBy(array, GetHash) {
  let len = array.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++) {
    let n = GetHash(array[i]) | 0
    for (let j = 0; j < 4; j++) {
      hash *= FNV_PRIME
      hash |= 0
      hash ^= n & 0xFF
      n >>>= 8
    }
  }

  return checkNaN(hash)
}

function checkNaN(n) {
  if (isNaN(n)) throw TypeError("Expected non-NaN: " + n)
  return n
}