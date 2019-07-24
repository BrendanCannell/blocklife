import * as S from "../src/store"
import * as Leaf from "../src/leaf"
import * as Neighborhood from "../src/neighborhood"
import Canonicalize from "../src/canonicalize"
import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import * as Loc from "./util/location"
import {pick, map, go} from "./util/data"

let leafStore = S.New(Leaf.Malloc)
let leafMemoTable = new Map()

let neighborhoodStore = S.New(Neighborhood.Malloc)
let neighborhoodMemoTable = new Map()

let C8izeLeaf = Canonicalize({
  ...pick(['Hash', 'Equal', 'SetDerived'])(Leaf),
  ...pick(['Malloc', 'Free'])(leafStore),
  GetCanon: hash => leafMemoTable.get(hash),
  SetCanon: (hash, node) => leafMemoTable.set(hash, node)
})

let C8izeNeighborhood = Canonicalize({
  ...pick(['Hash', 'Equal', 'SetDerived'])(Neighborhood),
  ...pick(['Malloc', 'Free'])(neighborhoodStore),
  GetCanon: hash => neighborhoodMemoTable.get(hash),
  SetCanon: (hash, node) => neighborhoodMemoTable.set(hash, node)
})

let withC8izedLeaf = {
  ...Leaf,
  ...go(Leaf,
      pick(['Copy', 'FromLiving', 'Next', 'Set']),
      map(C8izeLeaf))
}

let C8izedNeighborhood = C8izeNeighborhood(Neighborhood.New)
let plainNext = withC8izedLeaf.Next

let withMemoizedNeighborhood = {
  ...withC8izedLeaf,
  Next: (...args) => {
    let neighborhood = C8izedNeighborhood(...args)

    if (!neighborhood.next) {
      neighborhood.next = plainNext(neighborhood)
    }

    return neighborhood.next
  }
}

let L = withMemoizedNeighborhood

let rng = seedrandom(0)

let size = L.SIZE

let empty4 = [...Array(4)].map(() => L.FromLiving([]))

let emptyNeighborhood = node => [node, ...empty4, ...empty4]

let RandomLocations = () => Loc.RandomLocations(size, rng)
let InBounds = Loc.InBounds(size)
  
let randomData = []
let withRandoms = (n, fn) => () => {
  while (n > randomData.length) {
    let rl = RandomLocations()

    let startAlive = rl.alive.slice(5)
    let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
    let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

    let start = L.FromLiving(startAlive)
    let leaf = L.Set(start, [...setAlive, ...setDead])

    randomData.push({leaf, ...rl})
  }

  for (n--; n >= 0; n--) fn(randomData[n])
}

describe('Leaf', () => {

  let n = 10

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({leaf, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => L.Get(leaf, cell)))
    || outOfBounds.forEach(cell => assert.throws(() => L.Set(leaf, cell)))))

  it(".alive() = set cells", withRandoms(n, ({alive, leaf}) => {
    assert.deepEqual([...L.Living(leaf)].sort(order), alive)
  }))

  it(".get(<set cell>) = true", withRandoms(n, ({leaf, alive}) =>
    alive.forEach(cell => assert.isTrue(L.Get(leaf, cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({leaf, dead}) =>
    dead.forEach(cell => assert.isFalse(L.Get(leaf, cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({leaf, alive}) => {
    let reference = next(alive).filter(InBounds)
    let nextLeaf;

    let before = process.hrtime.bigint()

    let runs = 1000
    for (let i = 0; i < runs; i++) nextLeaf = L.Next(...emptyNeighborhood(leaf))

    let after = process.hrtime.bigint()

    let nsPerRun = Number(after - before) / runs

    console.log(1000 * 1000 * 1000 / nsPerRun)

    assert.deepEqual([...L.Living(nextLeaf)].sort(order), reference)
  }))
})