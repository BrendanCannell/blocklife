import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import * as Loc from "./util/location"
import * as D from "../src/util/data"

import Tree from "../src/linker"

let {Branch: B, store} = Tree()

let clear = ctx => {
  ctx.leafStore.Clear()
  ctx.branchStore.Clear()
  ctx.memoStore.Clear()
  ctx.memoTable.clear()
}

let rng = seedrandom(0)

let size = 256
let empties = () => [...Array(8)].map(() => B.FromLiving(store, [], size))
let RandomLocations = () => Loc.RandomLocations(size, rng, {
  range: 64,
  offset: (size - 64)/2,
  alive: 1024,
  dead: 128,
  outOfBounds: 16
})
let InBounds = Loc.InBounds(size)

let withRandoms = (n, fn) => () => {
  for (; n > 0; n--) {
    let rl = RandomLocations()

    D.map(x => x.Clear())(store)

    let startAlive = rl.alive.slice(5)
    let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
    let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

    let start = B.FromLiving(store, startAlive, size)
    let node = B.Set(store, start, [...setAlive, ...setDead])

    fn({node, ...rl})
  }
}

describe('Branch', () => {
  let n = 3

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({node, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => B.Get(store, node, cell)))
    || outOfBounds.forEach(cell => assert.throws(() => B.Set(store, node, cell, false)))))

  it(".alive() = set cells", withRandoms(n, ({alive, node}) => {
    assert.deepEqual([...B.Living(store, node)].sort(order).slice(0, 10), alive.slice(0, 10))
  }))

  it(".get(<set cell>) = true", withRandoms(n, ({node, alive}) =>
    alive.forEach(cell => assert.isTrue(B.Get(store, node, cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({node, dead}) =>
    dead.forEach(cell => assert.isFalse(B.Get(store, node, cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({node, alive}) => {
    let reference = next(alive).filter(InBounds)
    var nextNode;
    
    for (let i = 0; i < 10; i++) {
      nextNode = B.Next(store, node, ...empties())
    }

    assert.deepEqual([...B.Living(store, nextNode)].sort(order), reference)
  }))
})