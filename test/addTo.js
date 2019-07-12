import {assert} from 'chai'
import * as G from "./util/glider"

// let expected = (locations, size)

let _0 = n => [...Array(n)].fill(0)

let expected_d1 = G.Block([0, 0]).rows.slice(0, 32)

let expected_d2 = new Int32Array(64)

let X = x => 1 << 31 - x
expected_d2[0] = X(1)
expected_d2[1] = 0

expected_d2[2] = 0
expected_d2[3] = X(2) >>> 1

expected_d2[4] = X(1)
expected_d2[5] = X(0) + X(2) >>> 1

describe('Block#addTo', () => {
  it("#addTo correctly projects a glider with divisions = 1", () => {
    let b = G.Block([0, 0])

    let data = new Int32Array(32)
    let opts = {
      data: data,
      Offset: (x, y) => x * 1 / 32 * 32 + y * 32 / 32,
      divisions: 1,
      mask: 0xFFFFFFFF
    }
    let expected = expected_d1

    b.addTo(opts, 0)

    assert.deepEqual(data, expected)
  })

  it("#addTo correctly projects a glider with divisions = 2", () => {
    let b = G.Block([0, 0])

    let data = new Int32Array(64)
    let opts = {
      data: data,
      Offset: (x, y) => x * 2 * 1 / 32 * 32 + y * 2 * 32 / 32,
      divisions: 2,
      mask: 0x55555555
    }
    let expected = new Int32Array(expected_d2)

    b.addTo(opts, 0, 0)

    assert.deepEqual(data, expected)
  })
})

describe('Node#addTo', () => {
  it("#addTo correctly projects a glider with divisions = 1", () => {
    let n = G.Node([0, 32 + 10])

    let data = new Int32Array(32 * 4)
    let opts = {
      data: data,
      Offset: (x, y) => x * 1 / 32 * 32 + y * 64 / 32,
      divisions: 1,
      mask: 0xFFFFFFFF
    }
    let expected = new Int32Array([..._0(32 * 2 + 10), ...expected_d1, ..._0(32 - 10)])

    n.addTo(opts, 0, 0)

    assert.deepEqual(data, expected)
  })

  it("#addTo correctly projects a glider with divisions = 2", () => {
    let n = G.Node([30, 30])

    let data = new Int32Array(32 * 2 * 4)
    let opts = {
      data: data,
      Offset: (x, y) => x * 2 * 1 / 32 * 32 + y * 2 * 64 / 32,
      divisions: 2,
      mask: 0x55555555
    }
    let expected = new Int32Array(32 * 2 * 4)

    let X = x => 1 << 31 - x
    expected[0 * 64 + 30 * 2 + 0] = X(31)
    expected[0 * 64 + 30 * 2 + 1] = 0

    expected[1 * 64 + 31 * 2 + 0] = 0
    expected[1 * 64 + 31 * 2 + 1] = X(0) >>> 1

    expected[2 * 64 + 0 * 2 + 0] = X(31)
    expected[2 * 64 + 0 * 2 + 1] = X(30) >>> 1

    expected[3 * 64 + 0 * 2 + 0] = 0
    expected[3 * 64 + 0 * 2 + 1] = X(0) >>> 1

    n.addTo(opts, 0, 0)

    assert.deepEqual(data, expected)
  })
})