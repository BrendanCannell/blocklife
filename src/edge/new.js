import * as U from "../util"
import {Malloc} from "../context"

let defaultMalloc = {Malloc: () => Malloc.Edge()()}

export default U.apply(defaultMalloc)(({Malloc}) =>
  function NewEdge(e0, e1) {
    let raw = Malloc()
    raw[0] = e0
    raw[1] = e1
    return raw
  })