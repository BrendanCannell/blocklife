import Block from "../src/block"
import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import * as L from "./util/location"

let rng = seedrandom(0)

let size = Block.SIZE
let empties = [...Array(8)].map(() => Block.EMPTY)
let RandomLocations = () => L.RandomLocations(size, rng)
let InBounds = L.InBounds(size)

let randomData = []
let withRandoms = (n, fn) => () => {
  while (n > randomData.length)
    randomData.push({block: Block(), ...RandomLocations()})

  randomData.forEach(r => {
    r.alive.forEach(c => r.block = r.block.set(c, true))
    r.dead.forEach(c => r.block = r.block.set(c, false))
    r.block = r.block.sync()
  })

  for (n--; n >= 0; n--) fn(randomData[n])
}

describe('Block', () => {

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
    let reference = next(alive).filter(InBounds)
    block.next({}, ...empties)

    assert.deepEqual([...block.alive()].sort(order), reference)
  }))
})