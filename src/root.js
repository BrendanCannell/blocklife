// // import * as L from "./leaf"
// // import * as B from "./branch"

// // import * as S from "./store"
// import {Branch as B} from "./linker"
// // import {assert} from 'chai'
// // import seedrandom from 'seedrandom'
// // import {next, order} from "./util/life"
// // import * as Loc from "./util/location"
// // import {pick, map, go} from "./util/data"

// // next(Root(N)) -> Root(N) | Root(2N)

// let ceilPow2 = n => Math.pow(Math.ceil(Math.log2(n)), 2)
// let floor32 = n => Math.floor(n * 32) / 32
// let ceil32 = n => Math.ceil(n * 32) / 32

// export let FromLiving = locations => {
//   let max = locations.reduce((max, [x, y]) =>
//     Math.max(max, Math.abs(x), Math.abs(y)), 0)

//   let offset = ceilPow2(max)

//   return B.FromLiving(
//     locations.map(([x, y]) => [x + offset, y + offset]),
//     offset * 2
//   )
// }

// export let Living = function*(root) {
//   let offset = root.size / 2

//   for (let [x, y] of B.Living(root))
//     yield [x - offset, y - offset]
// }

// // export let Next = 

// let LocationFromCorner = (root, [x, y]) => {
//   let d = root.size / 2
//   let inRoot = -d <= x && x < d && -d <= y && y < d

//   return inRoot && [x + d, y + d]
// }

// let LocationFromOrigin = (root, [x, y]) => {
//   let d = root.size / 2

//   return [x - d, y - d]
// }