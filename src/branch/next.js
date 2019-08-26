import * as D from "../direction"

export default ({Malloc, Recur: Next}) =>
  function BranchNext(
    size,
    branch,
    N,  S,  W,  E,
    NW, NE, SW, SE
  ) {
    let raw = Malloc(branch)
      , b = branch
      , subgrids = [
          NW[D.SE],
          N [D.SW],
          N [D.SE],
          NE[D.SW],

          W [D.NE],
          b [D.NW],
          b [D.NE],
          E [D.NW],

          W [D.SE],
          b [D.SW],
          b [D.SE],
          E [D.SW],

          SW[D.NE],
          S [D.NW],
          S [D.NE],
          SE[D.NW]
        ]
      , sg = subgrids
      , childSize = size / 2

    for (let q = 0; q < 4; q++) {
      let xOffset = 1 + (q & 1)      // [1, 2, 1, 2]
        , yOffset = 2 + (q & 2) << 1 // [4, 4, 8, 8]
        , _ = xOffset + yOffset
        , N = -4
        , S =  4
        , W = -1
        , E =  1

      if (q === D.SE) {
        if (sg[_ + W] !== b [D.SW]) throw Error("SW")
      }
      
      raw[q] = Next(
        childSize,
        sg[_],
        sg[_ + N],
        sg[_ + S],
        sg[_ + W],
        sg[_ + E],
        sg[_ + N + W],
        sg[_ + N + E],
        sg[_ + S + W],
        sg[_ + S + E])
    }

    return raw
  }