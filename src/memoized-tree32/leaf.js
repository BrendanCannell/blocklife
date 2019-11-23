import Leaf from "../leaf32"
import ToCanonicalizeConstructor from "../leaf32/canonical-constructor"
import {Allocate as AllocateCtx} from "../context"
let AllocateCtxLeaf = AllocateCtx.Leaf
let AllocateLeaf = (...args) => AllocateCtxLeaf()(...args)
let CanonicalizeLeafConstructor = ToCanonicalizeConstructor()
export default {...Leaf, Allocate: AllocateLeaf, CanonicalizeConstructor: CanonicalizeLeafConstructor}