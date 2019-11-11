import * as U from "../src/util"
import Store from "../src/canonical-store32"
import LetStore from "../src/let-store"
import Malloc from "../src/leaf32/malloc"
import CanonicalConstructor from "../src/leaf32/canonical-constructor"
import FromLiving from "../src/leaf32/from-living"
import Get from "../src/leaf32/get"
import Living from "../src/leaf32/living"
import Next from "../src/leaf32/next"
import Set from "../src/leaf32/set"

let L = {
  ...U.map(fn => fn())({Get, Living}),
  ...U.map(fn => CanonicalConstructor(fn({Malloc})))({FromLiving, Next, Set})
}

// {
//   before: [ [ 30, 35 ], [ 31, 35 ], [ 29, 36 ], [ 31, 36 ], [ 31, 37 ] ],
//   after: [ [ 30, 35 ], [ 31, 35 ], [ 31, 36 ], [ 30, 37 ] ]
// }

export let testNE = t => {
  process.debug = true
  let {e, left} = LetStore(Store(), () => {
        let d = 0
        return {
          e:    L.FromLiving(null, []),
          left: L.FromLiving(null, [[30,3+d],[31,3+d],[29,4+d],[31,4+d],[31,5+d]])
        }
      })
    , {leftNext, rightNext} = LetStore(Store(), () => {
        return {
          leftNext:  L.Next(null, left, e, e, e, e, e, e, e, e),
          rightNext: L.Next(null, e, e, e, left, e, e, e, e, e)
        }
      })
  console.log({edges: left.edges})
  console.log({
    left:  [...L.Living(null, leftNext)],
    right: [...L.Living(null, rightNext)]
  })
  process.debug = false
}