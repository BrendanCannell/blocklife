import * as S from "../src/store"
import * as Leaf from "../src/leaf"
import * as Branch from "../src/branch"
import * as MemoNext from "../src/memoNext"
import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import * as Loc from "./util/location"
import {go, map, pick, pipe} from "./util/data"

let api = ['AddTo', 'Copy', 'Equal', 'FromLiving', 'Get', 'Living', 'Next', 'Set']

let leafStore = S.New(Leaf.Malloc)
let branchStore = S.New(Branch.Malloc)
let leafMemoCtx = {memoTable: new Map(), store: S.New(MemoNext.Malloc)}
let branchMemoCtx = {memoTable: new Map(), store: S.New(MemoNext.Malloc)}

let SetMalloc = Malloc => Node => ({
  ...Node,
  ...go(Node,
      pick(api),
      map(fn => (opts = {}) => fn({...opts, Malloc})))
})

let Fix = (toLeafCase, toBranchCase) => () => {
  let Dispatcher = (node, ...rest) =>
    node.size === Leaf.SIZE
      ? LeafCase(node, ...rest)
      : BranchCase(node, ...rest)
      
  let LeafCase = toLeafCase()
  let BranchCase = toBranchCase({Recur: Dispatcher})

  return Dispatcher
}

let FixBranch = ({Leaf, Branch}) => {
  let polymorphicFirstArg =
    ['AddTo', 'Copy', 'Equal', 'Get', 'Living', 'Next', 'Set']
      .map(name => [name, Fix(Leaf[name], Branch[name])])

  let FromLiving = () => {
    let FromLiving = (locations, size) =>
      size === Leaf.SIZE
        ? LeafCase(locations, size)
        : BranchCase(locations, size)

    let LeafCase = Leaf.FromLiving()
    let BranchCase = Branch.FromLiving({Recur: FromLiving})

    return FromLiving
  }
  
  return {
    Leaf,
    Branch: {
      ...Branch,
      ...Object.fromEntries(polymorphicFirstArg),
      FromLiving
    }
  }
}

let memoizeNext = memoCtx => Node => {
  let MN = MemoNext.MemoNext

  return {
    ...Node,
    Next: (...args) => MN({
      Next: Node.Next(...args),
      Equal: () => true,
      Malloc: () => memoCtx.store.Get(),
      Free: memo => memoCtx.store.Free(memo),
      memoTable: memoCtx.memoTable
    })
  }
}

// let patchNext = getMemoCtx => Node => {
//   let memoNext = MemoNext.Link({Tree: Node})

//   return {
//     ...Node,
//     Next: (...args) => memoNext(getMemoCtx(), ...args)
//   }
// }

let configure = (Node, Malloc, memoCtx) =>
  go(Node,
    SetMalloc(Malloc),
    memoizeNext(memoCtx)
    )

let configured = (() => {
  let leafGet = leafStore.Get
  let branchGet = branchStore.Get

  return {
    Leaf: configure(Leaf, () => leafGet(), leafMemoCtx),
    Branch: configure(Branch, () => branchGet(), branchMemoCtx)
  }
})()

let fixed = FixBranch(configured)

let forceApi = pipe([
  pick(api),
  map(fn => fn())
])

let Tree = map(forceApi)(fixed)

let {Branch: B} = Tree

let clear = ctx => {
  ctx.leafStore.Clear()
  ctx.branchStore.Clear()
  ctx.memoStore.Clear()
  ctx.memoTable.clear()
}

let rng = seedrandom(0)

let size = 128
let empties = [...Array(8)].map(() => B.FromLiving([], size))
let RandomLocations = () => Loc.RandomLocations(size, rng)
let InBounds = Loc.InBounds(size)
  
let randomData = []
let withRandoms = (n, fn) => () => {
  while (n > randomData.length) {
    let rl = RandomLocations()

    let startAlive = rl.alive.slice(5)
    let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
    let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

    let start = B.FromLiving(startAlive, size)
    let node = B.Set(start, [...setAlive, ...setDead])

    randomData.push({node, ...rl})
  }

  for (n--; n >= 0; n--) fn(randomData[n])
}

describe('Branch', () => {

  let n = 3

  it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({node, outOfBounds}) =>
    outOfBounds.forEach(cell => assert.throws(() => B.Get(node, cell)))
    || outOfBounds.forEach(cell => assert.throws(() => B.Set(node, cell, false)))))

  it(".alive() = set cells", withRandoms(n, ({alive, node}) => {
    assert.deepEqual([...B.Living(node)].sort(order).slice(0, 10), alive.slice(0, 10))
  }))

  it(".get(<set cell>) = true", withRandoms(n, ({node, alive}) =>
    alive.forEach(cell => assert.isTrue(B.Get(node, cell)))))

  it(".get(<non-set cell>) = false", withRandoms(n, ({node, dead}) =>
    dead.forEach(cell => assert.isFalse(B.Get(node, cell)))))

  it(".next(...empties) agrees with reference", withRandoms(n, ({node, alive}) => {
    let reference = next(alive).filter(InBounds)
    var nextNode;

    // let ctxOn = Context()
    // let ctxOff = Context()
    
    for (let i = 0; i < 100; i++) {
      nextNode = B.Next(node, ...empties)

      // let tmp = ctxOn
      // ctxOn = ctxOff
      // ctxOff = tmp

      // clear(ctxOff)
    }

    assert.deepEqual([...B.Living(nextNode)].sort(order), reference)
  }))
})