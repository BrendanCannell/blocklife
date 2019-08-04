import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next} from "./util/life"
import * as Loc from "./util/location"

import Grid from "../src/grid"
import Store from "../src/canonical-store"

let G = Grid
let store = Store()

let rng = seedrandom(0)

let size = 256
let empties = () => [...Array(8)].map(() => G.FromLiving(store, size, []))
let RandomLocations = () => Loc.Randoms(size, rng, {
  range: 64,
  offset: (size - 64)/2,
  alive: 1024,
  dead: 128,
  outOfBounds: 16
})
let InBounds = Loc.InBounds(size)

let order = Loc.AscXGroupedByDescY

let withRandoms = (n, fn) => () => {
  for (; n > 0; n--) {
    let rl = RandomLocations()

    store.Clear()

    let startAlive = rl.alive.slice(5)
    let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
    let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

    let start = G.FromLiving(store, size, startAlive)
    let node = G.Set(store, start, [...setAlive, ...setDead])

    fn({node, ...rl})
  }
}

describe('Branch', () => {
  let n = 3

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({node, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => G.Get(store, node, cell)))
    || outOfBounds.forEach(cell => assert.throws(() => G.Set(store, node, cell, false)))))

  it(".alive() = set cells", withRandoms(n, ({alive, node}) => {
    assert.deepEqual([...G.Living(store, node)].sort(order).slice(0, 10), alive.slice(0, 10))
  }))

  it(".get(<set cell>) = true", withRandoms(n, ({node, alive}) =>
    alive.forEach(cell => assert.isTrue(G.Get(store, node, cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({node, dead}) =>
    dead.forEach(cell => assert.isFalse(G.Get(store, node, cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({node, alive}) => {
    let reference = next(alive).filter(InBounds)
    var nextNode;
    
    for (let i = 0; i < 10; i++) {
      nextNode = G.Next(store, node, ...empties())
    }

    assert.deepEqual([...G.Living(store, nextNode)].sort(order), reference)
  }))
})