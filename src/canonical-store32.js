import {ToMakeCanonicalStore} from './canonical-store'
import Branch from "./branch/storable"
import Edge from "./edge/storable"
import Leaf from "./leaf32/storable"
import Neighborhood from "./neighborhood/storable"

let MakeCanonicalStore = ToMakeCanonicalStore({Branch, Edge, Leaf, Neighborhood})
export default MakeCanonicalStore