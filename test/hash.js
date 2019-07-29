import * as H from "../src/hash"
import {assert} from 'chai'

let testString = (str, reference) => () => {
  let codes = str.split("").map(c => c.charCodeAt(0))

  if (str.length % 4 !== 0) throw TypeError("`str` must be a multiple of 4 in length")

  let chunks =
    [...Array(str.length / 4).keys()]
      .map(i => codes.slice(4 * i, 4 * (i + 1)))

  let shifted = chunks.map(chk => chk.map((c, i) => c << i * 8))

  let i32s = shifted.map(chk => chk.reduce((acc, c) => acc + c, 0))

  let h1 = H.finalize(i32s.reduce(H.reducer, i32s.length * 4))
  let h2 = H.ofArray(i32s)
  let h3 = H.ofHashedArray(i32s.map(hash => ({hash})))
  let h4 = H.of(...i32s)

  assert.strictEqual(h1, reference)
  assert.strictEqual(h2, reference)
  assert.strictEqual(h3, reference)
  assert.strictEqual(h4, reference)
}

describe("Hash", () => {
  it("Hash('untossed') = 668950620", testString("untossed", 668950620))
  it("Hash('unworked') = 668950620", testString("unworked", 668950620))
})