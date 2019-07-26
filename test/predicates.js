import {assert} from 'chai'
import * as C from 'rho-contracts'
import * as P from "./util/predicates"

describe("Int", () => {
  console.log(P.equalLocations.check([[1, 0], [0, 0]]))
  // it("Int(3) === true", () => assert.throws(() => P.Loc.check([1, 2, 3])))
})