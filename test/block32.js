import Block32 from "../src/block32"
import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"

let rng = seedrandom(0)

let size = Block32.SIZE
let inBounds = ([x, y]) => x >= 0 && x < size && y >= 0 && y < size

let allIndexes = [...Array(size).keys()]
let allCells = allIndexes.flatMap(x => allIndexes.map(y => [x, y])).sort(order)
let empties = [...Array(8)].map(() => Block32.EMPTY)

let RandomCells = () => {
  let alive = allCells.filter(() => rng() > 0.1).sort(order)
  let dead = allCells.filter(pair => !alive.includes(pair)).sort(order)
  let outOfBounds = alive.map(([x, y], i) => 
         i % 3 === 0 && [x,     bad()]
      || i % 3 === 1 && [bad(), y    ]
      || i % 3 === 2 && [bad(), bad()])

  return {alive, dead, outOfBounds}
}

let rand = (m, n) => (rng() * (n - m) | 0) + m
let good = () => rand(0, size)

let bad = () => {
  let n = rand(-10000, 10000)

  return n < 0 || n >= size ? n : bad()
}

let n = 100

let randomData = [...Array(n)].map(() => ({block: Block32(), ...RandomCells()}))

let withRandoms = (n, fn) => () => {
  for (; n > 0; n--) fn(randomData[n])
}

describe('Block32', () => {
  beforeEach(() =>
    randomData.forEach(r => r.alive.forEach(c => r.block.set(c, true)))
    || randomData.forEach(r => r.dead.forEach(c => r.block.set(c, false))))

  let n = 10

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({block, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => block.get(cell)))
    || outOfBounds.forEach(cell => assert.throws(() => block.set(cell)))))

  it(".alive() = set cells", withRandoms(n, ({block, alive}) => 
    assert.deepEqual([...block.alive()].sort(order), alive)))

  it(".get(<set cell>) = true", withRandoms(n, ({block, alive}) =>
    alive.forEach(cell => assert.isTrue(block.get(cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({block, dead}) =>
    dead.forEach(cell => assert.isFalse(block.get(cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({block, alive}) => {
    let reference = next(alive).filter(inBounds)
    block.next(...empties)

    assert.deepEqual(reference, [...block.alive()].sort(order))
  }))


})