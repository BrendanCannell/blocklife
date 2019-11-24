import CanonicalConstructor from "../canonical-constructor"
import {Canon} from "../context"
import {ofArray} from "../fnv-hash"
import Equal from "./equal"
import SetDerived from "./set-derived"
let Canonicalizable = {Equal, Hash: ofArray, SetDerived}
export default CanonicalConstructor(Canonicalizable, Canon.Leaf)