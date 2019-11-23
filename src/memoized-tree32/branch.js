import Leaf from "./leaf"
import ToCanonicalizeConstructor from "../branch/canonical-constructor"
import {Allocate as AllocateCtx} from "../context"
import Edge from "./edge"
import Branch from "../branch"
let LiftNamed = namedArgs => fn => (args = {}) => fn({...namedArgs, ...args})
let Copy = LiftNamed({EdgeCopy: Edge.Copy})(Branch.Copy)
let AllocateCtxBranch = AllocateCtx.Branch
let AllocateBranch = (...args) => AllocateCtxBranch()(...args)
let CanonicalizeBranchConstructor = ToCanonicalizeConstructor({Edge, Leaf})
let New = CanonicalizeBranchConstructor(Branch.New({Allocate: AllocateBranch}))
export default {...Branch, Allocate: AllocateBranch, CanonicalizeConstructor: CanonicalizeBranchConstructor, Copy, New}