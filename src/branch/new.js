import * as U from "../util"
import {Malloc} from "../context"

export default U.apply({Malloc: () => Malloc.Branch()()})(({Malloc}) =>
  function NewBranch(...quadrants) {
    let raw = Malloc()
    for (let i = 0; i < 4; i++)
      raw[i] = quadrants[i]
    return raw
  })