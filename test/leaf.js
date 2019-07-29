import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import * as Loc from "./util/location"
import * as D from "../src/util/data"

import Tree from "../src/linker"

let {Leaf: L, store} = Tree()

let rng = seedrandom(0)

let size = L.SIZE

let empty4 = () => [...Array(4)].map(() => L.FromLiving(store, []))

let emptyNeighborhood = node => [node, ...empty4(), ...empty4()]

let RandomLocations = () => Loc.RandomLocations(size, rng, {alive: 256, dead: 16, outOfBounds: 16})
let InBounds = Loc.InBounds(size)

let withRandoms = (n, fn) => () => {
  for (; n > 0; n--) {
    let rl = RandomLocations()

    D.map(x => x.Clear())(store)

    let startAlive = rl.alive.slice(5)
    let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
    let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

    let start = L.FromLiving(store, startAlive)
    let leaf = L.Set(store, start, [...setAlive, ...setDead])

    fn({leaf, ...rl})
  }
}

describe('Leaf', () => {

  let n = 10

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({leaf, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => L.Get(store, leaf, cell)))
    || outOfBounds.forEach(cell => assert.throws(() => L.Set(store, leaf, cell)))))

  it(".alive() = set cells", withRandoms(n, ({alive, leaf}) => {
    assert.deepEqual([...L.Living(store, leaf)].sort(order), alive)
  }))

  it(".get(<set cell>) = true", withRandoms(n, ({leaf, alive}) =>
    alive.forEach(cell => assert.isTrue(L.Get(store, leaf, cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({leaf, dead}) =>
    dead.forEach(cell => assert.isFalse(L.Get(store, leaf, cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({leaf, alive}) => {
    let reference = next(alive).filter(InBounds)
    let nextLeaf = L.Next(store, ...emptyNeighborhood(leaf))

    assert.deepEqual([...L.Living(store, nextLeaf)].sort(order), reference)
  }))
})