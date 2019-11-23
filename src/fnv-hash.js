const FNV_PRIME = 16777619
const FNV_OFFSET_BASIS = 2166136261

let checkNaN = n => {
  if (isNaN(n)) throw TypeError("Expected non-NaN: " + n)
  return n
}

export function of() {
  let len = arguments.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++)
    hash = reducer(hash, arguments[i] | 0)

  return checkNaN(hash)
}

export function ofArray(array) {
  let len = array.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++) {
    let n = checkNaN(array[i]) | 0
    for (let j = 0; j < 4; j++) {
      hash *= FNV_PRIME
      hash |= 0
      hash ^= n & 0xFF
      n >>>= 8
    }
  }

  return checkNaN(hash)
}

export function ofArrayBy(array, GetHash) {
  let len = array.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++)
    hash = reducer(hash, GetHash(array[i]) | 0)

  return checkNaN(hash)
}

export function ofHashedArray(array) {
  let len = array.length
  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < len; i++)
    hash = reducer(hash, array[i].hash | 0)

  return checkNaN(hash)
}

export function reducer(hash, n) {
  hash = hash | 0
  n = checkNaN(n) | 0

  for (let i = 0; i < 4; i++) {
    hash *= FNV_PRIME
    hash |= 0
    hash ^= n & 0xFF
    n >>>= 8
  }

  return hash
}

export function finalize(hash) {
  return hash
}