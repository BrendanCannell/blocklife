import Leaf from "../leaf32"
import CanonicalizeLeafConstructor from "../leaf32/canonical-constructor"
import {Allocate as AllocateCtx} from "../context"
let LeafAllocateCtx = AllocateCtx.Leaf
let LeafAllocate = (...args) => LeafAllocateCtx()(...args)
export default {...Leaf, Allocate: LeafAllocate, CanonicalizeConstructor: CanonicalizeLeafConstructor}