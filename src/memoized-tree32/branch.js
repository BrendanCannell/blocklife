import * as U from "../util"
import Leaf from "./leaf"
import ToCanonicalizeConstructor from "../branch/canonical-constructor"
import {Allocate as AllocateCtx} from "../context"
import Edge from "./edge"
import Branch from "../branch"
let Copy = U.partialOpts(Branch.Copy)({EdgeCopy: Edge.Copy})
let BranchAllocateCtx = AllocateCtx.Branch
let BranchAllocate = (...args) => BranchAllocateCtx()(...args)
let CanonicalizeBranchConstructor = ToCanonicalizeConstructor({Edge, Leaf})
let New = CanonicalizeBranchConstructor(Branch.New({Allocate: BranchAllocate}))
export default {...Branch, Allocate: BranchAllocate, CanonicalizeConstructor: CanonicalizeBranchConstructor, Copy, New}