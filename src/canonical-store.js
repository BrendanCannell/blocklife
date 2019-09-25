import CanonicalStore from './canonical-store-modular'
import Branch from "./branch/storable"
import Edge from "./edge/storable"
import Leaf from "./leaf32/storable"
import Neighborhood from "./neighborhood/storable"

let MakeStore = CanonicalStore({Branch, Edge, Leaf, Neighborhood})
export default () => console.log('Store') || MakeStore()