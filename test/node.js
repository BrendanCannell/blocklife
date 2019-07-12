import Node from "../src/node"
import Block from "../src/block"
import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import {InBounds, RandomLocations} from "./util/location"

describe('Node', () => {
  let context = {
    empties: [],
    getEmpty(size) {
      return this.empties[size]
    }
  }
  context.empties[Block.SIZE] = Block.EMPTY
  context.empties[Block.SIZE * 2] = Node.Empty(context, Block.SIZE * 2)
  context.empties[Block.SIZE * 4] = Node.Empty(context, Block.SIZE * 4)

  let es = context.empties

  let closedNext = g => g.next({sync: false}, g, g, g, g, g, g, g, g)
  let openNext = g => {
    let e = g.grid.getEmpty(g.size)

    return g.next({sync: false}, e, e, e, e, e, e, e, e)
  }

  let node64 =  () => Node(context, Block.SIZE * 2)
  let node128 = () => Node(context, Block.SIZE * 4)

  let rng = seedrandom(0)

  let rl64 = () => RandomLocations(node64().size, rng)

  it("Node.EMPTY.next(<closed>) = Node.EMPTY", () => {
    assert.strictEqual(closedNext(es[64]), es[64])
  })

  it(".alive() = set cells", () => {
    let rl = rl64()
    let node = node64()
    for (let loc of rl.alive) node = node.set(loc, true)

    let alive = [...node.alive()].sort(order)

    assert.deepEqual(alive, rl.alive)
  })

  it(".next(<empties>) agrees with reference", () => {
    for (let _ of [...Array(10)]) {
      let rl = rl64()
      let node = node64()
      for (let loc of rl.alive) node = node.set(loc, true)
      node.sync()

      let reference = next(rl.alive).filter(InBounds(node.size))
      openNext(node)

      assert.deepEqual([...node.alive()].sort(order), reference)
    }
  })
})