// import * as S from "../src/store"
// import * as Leaf from "../src/leaf"
// import {assert} from 'chai'
// import seedrandom from 'seedrandom'
// import {next, order} from "./util/life"
// import * as Loc from "./util/location"

// let leafStore = S.New(Leaf.Malloc)
// // let branchStore = S.New(Branch.Malloc)

// let pipe = ([op, ...rest]) =>
//   (...args) => rest.reduceRight((acc, fn) => fn(acc), op(...args))

// let go = (data, ...ops) => pipe(ops)(data)

// let zip = objs => {
//   let keys = Object.keys(Object.assign({}, objs))
//   let entries = keys.map(k => [k, objs.map(obj => obj[k])])

//   return Object.fromEntries(entries)
// }

// let pick = keys => filter(([key]) => keys.includes(key))

// let asPairs = fn => obj =>
//   Object.fromEntries(fn(Object.entries(obj)))

// let filter = fn => asPairs(obj =>
//   obj.filter(fn))

// let map = fn => asPairs(obj =>
//   obj.map(([key, value]) => [key, fn(value)]))

// let withRaw = store => fn =>
//   (...args) => fn(...args, store.Get())

// let patchAllocative = (Node, store) => ({
//   ...Node,
//   ...go(Node,
//       pick(allocative),
//       map(withRaw(store)))
// })

// let fns = {
//   AddTo: null,
//   Copy: null,
//   Equal: null,
//   FromLiving: null,
//   Get: null,
//   Living: null,
//   Next: null,
//   Set: null,
// }

// let allocative = ['Copy', 'FromLiving', 'Next', 'Set']
// let polymorphicFirstArg = ['AddTo', 'Copy', 'Equal', 'Get', 'Living', 'Malloc', 'Next', 'Set']


// let L = patchAllocative(Leaf, leafStore)

// // let B = patchAllocative(Branch.Link({child: fns}), branchStore)

// let dispatchFirstArg = ([branchFn, leafFn]) =>
//   (node, ...rest) =>
//     node.size === Leaf.SIZE
//       ? leafFn(node, ...rest)
//       : branchFn(node, ...rest)

// let dispatchFns =
//   go(zip([L, {}]),
//     pick(polymorphicFirstArg),
//     map(dispatchFirstArg))

// Object.assign(fns,
//   dispatchFns,
//   {
//     FromLiving: (locations, size) =>
//       size === Leaf.SIZE
//         ? L.FromLiving(locations, size)
//         : B.FromLiving(locations, size)
//   })

// let rng = seedrandom(0)

// let size = L.SIZE
// let empties = [...Array(8)].map(() => L.FromLiving([]))
// let RandomLocations = () => Loc.RandomLocations(size, rng)
// let InBounds = Loc.InBounds(size)
  
// let randomData = []
// let withRandoms = (n, fn) => () => {
//   while (n > randomData.length) {
//     let rl = RandomLocations()

//     let startAlive = rl.alive.slice(5)
//     let setAlive = rl.alive.slice(0, 5).map(loc => [loc, true])
//     let setDead = rl.dead.slice(0, 5).map(loc => [loc, false])

//     let start = L.FromLiving(startAlive)
//     let leaf = L.Set(start, [...setAlive, ...setDead])

//     randomData.push({leaf, ...rl})
//   }

//   for (n--; n >= 0; n--) fn(randomData[n])
// }

// describe('Leaf', () => {

//   let n = 10

//   it(".get/set(<out-of-bounds-cell>) throws exception", withRandoms(1, ({leaf, outOfBounds}) =>
//     outOfBounds.forEach(cell => assert.throws(() => L.Get(leaf, cell)))
//     || outOfBounds.forEach(cell => assert.throws(() => L.Set(leaf, cell)))))

//   it(".alive() = set cells", withRandoms(n, ({alive, leaf}) => {
//     assert.deepEqual([...L.Living(leaf)].sort(order), alive)
//   }))

//   it(".get(<set cell>) = true", withRandoms(n, ({leaf, alive}) =>
//     alive.forEach(cell => assert.isTrue(L.Get(leaf, cell)))))

//   it(".get(<non-set cell>) = false", withRandoms(n, ({leaf, dead}) =>
//     dead.forEach(cell => assert.isFalse(L.Get(leaf, cell)))))

//   it(".next(...empties) agrees with reference", withRandoms(n, ({leaf, alive}) => {
//     let reference = next(alive).filter(InBounds)
//     let nextLeaf = L.Next(leaf, ...empties)

//     assert.deepEqual([...L.Living(nextLeaf)].sort(order), reference)
//   }))
// })