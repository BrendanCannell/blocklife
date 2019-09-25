import {SIZE, WEST_EDGE} from "./constants"

let Render = () => function LeafRender(_size, leaf, leafLeftGrid, leafTopGrid, renderCfg) {
  let {imageData, viewport, scale: pixelsPerCell, colors} = renderCfg
    , {data, width: imageWidth, height: imageHeight} = imageData
    , {
        left:   viewportLeftGrid,
        right:  viewportRightGrid,
        top:    viewportTopGrid,
        bottom: viewportBottomGrid
      } = viewport
    , alive = colors.alive | 0
    , leafRightGrid  = leafLeftGrid + SIZE
    , leafBottomGrid = leafTopGrid  + SIZE
    // Viewport-constrained leaf boundaries, in grid coordinates
    , boundedLeftGrid   = max(leafLeftGrid,   viewportLeftGrid)
    , boundedRightGrid  = min(leafRightGrid,  viewportRightGrid)
    , boundedTopGrid    = max(leafTopGrid,    viewportTopGrid)
    , boundedBottomGrid = min(leafBottomGrid, viewportBottomGrid)
    // , boundedLeftGrid   = floor(max(leafLeftGrid,   viewportLeftGrid))
    // , boundedRightGrid  = floor(min(leafRightGrid,  viewportRightGrid))
    // , boundedTopGrid    = floor(max(leafTopGrid,    viewportTopGrid))
    // , boundedBottomGrid = floor(min(leafBottomGrid, viewportBottomGrid))
    // By rounding "out" we get...
    // ...the indexes of the first columns/rows to be drawn
    , columnStart = floor(boundedLeftGrid   - leafLeftGrid)
    , rowStart    = floor(boundedTopGrid    - leafTopGrid)
    // ...and the indexes of the first columns/rows to NOT be drawn
    , columnEnd   = ceil(boundedRightGrid  - leafLeftGrid)
    , rowEnd      = ceil(boundedBottomGrid - leafTopGrid)
    // Viewport-constrained leaf boundaries, in image coordinates
    , boundedLeftImage = (boundedLeftGrid - viewportLeftGrid) * pixelsPerCell
    , boundedTopImage  = (boundedTopGrid  - viewportTopGrid)  * pixelsPerCell
  imageWidth |= 0; imageHeight |= 0;
  for (
      let rowIndex = rowStart
        , cellTopImage = boundedTopImage
        , cellTopPx = ceil(cellTopImage);
      rowIndex < rowEnd;
      rowIndex++
    ) {
    let cellBottomImage = cellTopImage + pixelsPerCell
      , cellBottomPx = min(imageHeight, floor(cellBottomImage))
      , row = leaf[rowIndex] | 0
    for (
        let columnIndex = columnStart,
            cellLeftImage = boundedLeftImage,
            cellLeftPx = ceil(cellLeftImage);
        columnIndex < columnEnd;
        columnIndex++
      ) {
      let cellRightImage = cellLeftImage + pixelsPerCell
        , cellRightPx = min(imageWidth, floor(cellRightImage))
        , mask = WEST_EDGE >>> columnIndex
        , isAlive = (row & mask) !== 0
      if (isAlive)
        for (let y = cellTopPx; y < cellBottomPx; y++)
          for (let x = cellLeftPx; x < cellRightPx; x++)
            data[y * imageWidth + x] = alive
      cellLeftImage = cellRightImage
      cellLeftPx    = cellRightPx
    }
    cellTopImage = cellBottomImage
    cellTopPx    = cellBottomPx
  }

  if (debug && Math.random() < 0.01) {
    console.log({
      leafLeftGrid, leafRightGrid, leafTopGrid, leafBottomGrid, columnStart, columnEnd, rowStart, rowEnd,
      xStartLeaf: boundedLeftImage, yStartLeaf: boundedTopImage, imageWidth, scale: pixelsPerCell, viewport
    })
    debug = false
  }
}

let debug = true

let floor = x =>
      x >= 0
        ? x | 0
        : (x | 0) - 1
  , ceil = Math.ceil
  , max = (x, y) => x > y ? x : y
  , min = (x, y) => x > y ? y : x

export default Render