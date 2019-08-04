import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next} from "./util/life"
import * as Loc from "./util/location"

import Grid from "../src/grid"
import Store from "../src/canonical-store"

let G = Grid
let store = Store()

let rng = seedrandom(0)

let size = 32

let empty4 = () => [...Array(4)].map(() => G.FromLiving(store, 32, []))

let emptyNeighborhood = node => [node, ...empty4(), ...empty4()]

let RandomLocations = () => Loc.Randoms(size, rng, {alive: 256, dead: 16, outOfBounds: 16})
let InBounds = Loc.InBounds(size)

let order = Loc.AscXGroupedByDescY

let withRandoms = (n, fn) => () => {
  for (; n > 0; n--) {
    let rl = RandomLocations()

    store.Clear()

    let startAlive = rl.alive.slice(5)
    let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
    let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

    let start = G.FromLiving(store, 32, startAlive)
    let leaf = G.Set(store, start, [...setAlive, ...setDead])

    fn({leaf, ...rl})
  }
}

describe('Leaf', () => {

  let n = 10

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({leaf, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => G.Get(store, leaf, cell)))
    || outOfBounds.forEach(cell => assert.throws(() => G.Set(store, leaf, cell)))))

  it(".alive() = set cells", withRandoms(n, ({alive, leaf}) => {
    assert.deepEqual([...G.Living(store, leaf)].sort(order), alive)
  }))

  it(".get(<set cell>) = true", withRandoms(n, ({leaf, alive}) =>
    alive.forEach(cell => assert.isTrue(G.Get(store, leaf, cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({leaf, dead}) =>
    dead.forEach(cell => assert.isFalse(G.Get(store, leaf, cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({leaf, alive}) => {
    let reference = next(alive).filter(InBounds)
    let nextLeaf = G.Next(store, ...emptyNeighborhood(leaf))

    assert.deepEqual([...G.Living(store, nextLeaf)].sort(order), reference)
  }))
})