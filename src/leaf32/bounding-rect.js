import {SIZE, WEST_EDGE} from "./constants"

let BoundingRect = () => function LeafBoundingRect(leaf, leafLeft, leafTop, boundingRect) {
  if (leaf.population === 0) return boundingRect
  for (let y = 0; y < SIZE; y++) {
    let row = leaf[y]
    if (row !== 0) {
      let gridY = leafTop + y
      // Sign bit must be handled separately due to the use of `log2`
      let westBit    = row & WEST_EDGE
      let butWestBit = row & ~WEST_EDGE
      let westernmostSetBit = westBit    !== 0 ? 31 : (log2(butWestBit)      | 0)
      let easternmostSetBit = butWestBit === 0 ? 31 : (log2(lsb(butWestBit)) | 0)
      let westX = SIZE - 1 - westernmostSetBit
      let eastX = SIZE - 1 - easternmostSetBit
      let gridWest = westX + leafLeft
      let gridEast = eastX + leafLeft
      boundingRect.top    = min(gridY,        boundingRect.top)
      boundingRect.bottom = max(gridY + 1,    boundingRect.bottom)
      boundingRect.left   = min(gridWest,     boundingRect.left)
      boundingRect.right  = max(gridEast + 1, boundingRect.right)
    }
  }
  return boundingRect
}

let {log2} = Math
  , lsb = x => x & ~(x - 1)
  , max = (x, y) => x > y ? x : y
  , min = (x, y) => x > y ? y : x

export default BoundingRect