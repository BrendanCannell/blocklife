import Leaf from "../leaf32"
import CanonicalizeLeafConstructor from "../leaf32/canonical-constructor"
import {Allocate as AllocateCtx} from "../context"
let AllocateCtxLeaf = AllocateCtx.Leaf
let AllocateLeaf = (...args) => AllocateCtxLeaf()(...args)
export default {...Leaf, Allocate: AllocateLeaf, CanonicalizeConstructor: CanonicalizeLeafConstructor}