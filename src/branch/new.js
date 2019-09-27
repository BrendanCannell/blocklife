import * as U from "../util"
import {Malloc} from "../context"

export default U.apply({Malloc: () => Malloc.Branch()()})(({Malloc}) =>
  function NewBranch(size, ...quadrants) {
    let raw = Malloc()
    raw.size = size
    for (let i = 0; i < 4; i++)
      raw[i] = quadrants[i]
    return raw
  })