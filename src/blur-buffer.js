import * as U from "./util"
import Fix from "./fix-tree"

export default ({Branch, Leaf, LEAF_SIZE}) => {
  let Add = Fix(LEAF_SIZE)({Branch: Branch.Add, Leaf: Leaf.Add})
    , {New: LeafNew, Get: LeafGet} = Leaf

  return {Add, Clear, New, Draw}

  function Clear(blurBuffer) {
    let {buffer} = blurBuffer
      , len = buffer.length
    for (let i = 0; i < len; i++)
      buffer[i] = 0
    return blurBuffer
  }
  
  function Draw(colors, blurBuffer, drawData, viewport) {
    let {offsetPerRow, sizeCoefficient} = blurBuffer.branchDerived
      , {buffer, leafDerived} = blurBuffer // LeafGet
      , {divisionCount, divisionToCellMask} = leafDerived // LeafGet
      , image = drawData.data
      , imageWidth = drawData.width | 0
      , imageHeight = drawData.height | 0
      , {v0: [viewportX0, viewportY0], v1: [viewportX1]} = viewport
      , paddedX0 = U.floorBy(LEAF_SIZE, viewportX0) | 0
      , paddedY0 = U.floorBy(LEAF_SIZE, viewportY0) | 0
      , paddingX = viewportX0 - paddedX0
      , paddingY = viewportY0 - paddedY0
      , scale = imageWidth / (viewportX1 - viewportX0)
      // , dxs = new Int32Array(imageWidth)
      , divIndexes = new Int32Array(imageWidth)
      , divColumnOffsets = new Int32Array(imageWidth)
      , leafOffsetsX = new Int32Array(imageWidth)
    for (let imageX = 0; imageX < imageWidth; imageX++) {
      // in the grid coordinate system:
      // x of nearest cell, relative to the padded viewport
      let paddedX = floor(imageX / scale + paddingX) | 0
      // x of nearest cell's containing leaf, relative to the padded viewport
        , leafX = floor(paddedX / LEAF_SIZE) * LEAF_SIZE | 0
      // x of nearest cell, relative to the containing leaf
        , dx = paddedX - leafX
        , columnOffset = 31 - dx // LeafGet
        , divIndex = columnOffset % divisionCount // LeafGet
        , divColumnOffset = (columnOffset / divisionCount | 0) * divisionCount | 0 // LeafGet, changed from floor()
        , leafOffsetX = leafX * sizeCoefficient
      // dxs[imageX] = dx
      divIndexes[imageX] = divIndex // LeafGet
      divColumnOffsets[imageX] = divColumnOffset // LeafGet
      leafOffsetsX[imageX] = leafOffsetX
    }
    divisionCount |= 0; divisionToCellMask |= 0;
    for (let imageY = 0; imageY < imageHeight; imageY++) {
      let paddedY = floor(imageY / scale + paddingY) | 0
        , leafY = floor(paddedY / LEAF_SIZE) * LEAF_SIZE | 0
        , dy = paddedY - leafY
        , dyTimesDivisionCount = dy * divisionCount | 0
        , leafOffsetY = leafY * offsetPerRow | 0
        , imageRowOffset = imageY * imageWidth | 0
      for (let imageX = 0; imageX < imageWidth; imageX++) {
        let leafOffset = leafOffsetsX[imageX] + leafOffsetY
          // , dx = dxs[imageX]
          // , blur = LeafGet(leafOffset, dx, dy, blurBuffer) | 0
          , rowOffset = leafOffset + dyTimesDivisionCount
          , divOffset = rowOffset + divIndexes[imageX] | 0
          , div = buffer[divOffset] | 0
          , blur = divisionToCellMask & (div >>> divColumnOffsets[imageX])
        image[imageX + imageRowOffset] = colors[blur] | 0
      }
    }
    return drawData
  }
  
  function New({width: minWidth, height: minHeight, maxSteps}) {
    let width  = U.ceilBy(LEAF_SIZE, minWidth)  + LEAF_SIZE
      , height = U.ceilBy(LEAF_SIZE, minHeight) + LEAF_SIZE
      , {sizeCoefficient, leafDerived} = LeafNew({maxSteps})
      , offsetPerRow = width * sizeCoefficient / LEAF_SIZE
      , branchDerived = {
          sizeCoefficient,
          offsetPerRow
        }
      , buffer = new Int32Array(height * offsetPerRow)
      , blurBuffer = {
          width,
          height,
          maxSteps,
          buffer,
          leafDerived,
          branchDerived
        }
    return blurBuffer
  }
    // function New({width, height, maxSteps}) {
  //   let {v0: [vx0, vy0], v1: [vx1, vy1]} = viewport
  //     , bx0 = U.floorBy(LEAF_SIZE, vx0)
  //     , by0 = U.floorBy(LEAF_SIZE, vy0)
  //     , bx1 = U.ceilBy(LEAF_SIZE, vx1)
  //     , by1 = U.ceilBy(LEAF_SIZE, vy1)
  //     , bwidth  = U.ceilBy(LEAF_SIZE, width)  + width
  //     , bheight = U.ceilBy(LEAF_SIZE, height) + height
  //     , size = Math.max(bwidth, bheight)
  //     , {sizeCoefficient, leafDerived} = LeafNew({maxSteps})
  //     , branchDerived = {
  //         sizeCoefficient,
  //         offsetPerRow: bwidth * sizeCoefficient / LEAF_SIZE,
  //         viewportWidth: vx1 - vx0,
  //         xPadding: vx0 - bx0,
  //         yPadding: vy0 - by0,
  //         bx0,
  //         by0
  //       }
  //     , buffer = new Int32Array(size * size * sizeCoefficient / LEAF_SIZE)
  //     , blurBuffer = {
  //         viewport,
  //         maxSteps,
  //         buffer,
  //         leafDerived,
  //         branchDerived
  //       }
  //   return blurBuffer
  // }
}

let {floor} = Math