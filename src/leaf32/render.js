import {SIZE, WEST_EDGE} from "./constants"

let Render = () => function LeafRender(leaf, leafLeftGrid, leafTopGrid, renderCfg) {
  let {imageData, viewport, scale: pixelsPerCell, colors} = renderCfg
    , {
        left:   viewportLeftGrid,
        right:  viewportRightGrid,
        top:    viewportTopGrid,
        bottom: viewportBottomGrid
      } = viewport
    , data = imageData.data
    , imageWidth  = imageData.width  | 0
    , imageHeight = imageData.height | 0
    , alive = colors.alive | 0
    , leafRightGrid  = leafLeftGrid + SIZE
    , leafBottomGrid = leafTopGrid  + SIZE
    , leafTopImage  = (leafTopGrid  - viewportTopGrid)  * pixelsPerCell
    , leafLeftImage = (leafLeftGrid - viewportLeftGrid) * pixelsPerCell
    // Viewport-constrained leaf boundaries, in grid coordinates
    , boundedLeftGrid   = max(leafLeftGrid,   viewportLeftGrid)
    , boundedRightGrid  = min(leafRightGrid,  viewportRightGrid)
    , boundedTopGrid    = max(leafTopGrid,    viewportTopGrid)
    , boundedBottomGrid = min(leafBottomGrid, viewportBottomGrid)
    // Indexes of the first columns/rows to be drawn
    , columnStart = boundedLeftGrid  - leafLeftGrid
    , rowStart    = boundedTopGrid   - leafTopGrid
    // Indexes of the first columns/rows to NOT be drawn
    , columnEnd   = boundedRightGrid  - leafLeftGrid
    , rowEnd      = boundedBottomGrid - leafTopGrid
  if (pixelsPerCell <= 1) {
    columnStart = ceil(columnStart) | 0
    rowStart    = ceil(rowStart)    | 0
    columnEnd   = floor(columnEnd) | 0
    rowEnd      = floor(rowEnd)    | 0
    for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
      let row = leaf[rowIndex] | 0
        , y = (rowIndex * pixelsPerCell) + leafTopImage | 0
        , yOffset = y * imageWidth | 0
      for (let columnIndex = columnStart, mask = WEST_EDGE >>> columnStart; columnIndex < columnEnd; columnIndex++, mask >>>= 1) {
        let x = (columnIndex * pixelsPerCell) + leafLeftImage | 0
          , isAlive = (row & mask) !== 0
        if (isAlive)
          data[yOffset + x] = alive
      }
    }
  } else {
    // Round outward to include cells on the image edge
    columnStart = floor(columnStart) | 0
    rowStart    = floor(rowStart)    | 0
    columnEnd   = ceil(columnEnd)    | 0
    rowEnd      = ceil(rowEnd)       | 0
    for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
      let row = leaf[rowIndex] | 0
        , cellTopImage = (rowIndex * pixelsPerCell) + leafTopImage
        , cellBottomImage = cellTopImage + pixelsPerCell
        // Avoid wrapping when a cell is on the edge of the image
        , cellTopPx    = max(0,           cellTopImage)    | 0
        , cellBottomPx = min(imageHeight, cellBottomImage) | 0
      for (let columnIndex = columnStart; columnIndex < columnEnd; columnIndex++) {
        let cellLeftImage = (columnIndex * pixelsPerCell) + leafLeftImage
          , cellRightImage = cellLeftImage + pixelsPerCell
          // Avoid wrapping when a cell is on the edge of the image
          , cellLeftPx   = max(0,          cellLeftImage)  | 0
          , cellRightPx  = min(imageWidth, cellRightImage) | 0
          , mask = WEST_EDGE >>> columnIndex
          , isAlive = (row & mask) !== 0
        if (isAlive)
          for (let y = cellTopPx; y < cellBottomPx; y++) {
            let yOffset = y * imageWidth | 0
            for (let x = cellLeftPx; x < cellRightPx; x++)
              data[yOffset + x] = alive
          }
      }
    }
  }
}

let floor = Math.floor
  , ceil = Math.ceil
  , max = (x, y) => x > y ? x : y
  , min = (x, y) => x > y ? y : x

export default Render