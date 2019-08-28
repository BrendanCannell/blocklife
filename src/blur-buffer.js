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
  
  function Draw(colors, blurData, drawData) {
    let {offsetPerRow, sizeCoefficient, viewportWidth, xPadding, yPadding, bx0, by0} = blurData.rootDerived
      , dd = drawData
      , image = dd.data
      , iWidth = dd.width | 0
      , iHeight = dd.height | 0
      , scale = iWidth / viewportWidth
    bx0 |= 0; by0 |= 0;
    let dxs = new Int32Array(iWidth)
      , xLeafOffsets = new Int32Array(iWidth)
    for (let ix = 0; ix < iWidth; ix++) {
      let gx = ix / scale + xPadding | 0 // Truncation required
        , lx = floor(gx / LEAF_SIZE) * LEAF_SIZE | 0
      dxs[ix] = gx - lx
      xLeafOffsets[ix] = (lx - bx0) * sizeCoefficient
    }
    for (let iy = 0; iy < iHeight; iy++) {
      let gy = iy / scale + yPadding | 0 // Truncation required
        , ly = floor(gy / LEAF_SIZE) * LEAF_SIZE | 0
        , dy = gy - ly
        , yLeafOffset = (ly - by0) * offsetPerRow
        , iRowOffset = iy * iWidth | 0
      for (let ix = 0; ix < iWidth; ix++) {
        let leafOffset = xLeafOffsets[ix] + yLeafOffset
          , dx = dxs[ix]
          , blur = LeafGet(leafOffset, dx, dy, blurData) | 0
        image[iRowOffset + ix] = colors[blur] | 0
      }
    }
    return drawData
  }
  
  function New({viewport, maxSteps}) {
    let {v0: [vx0, vy0], v1: [vx1, vy1]} = viewport
      , bx0 = U.floorBy(LEAF_SIZE, vx0)
      , by0 = U.floorBy(LEAF_SIZE, vy0)
      , bx1 = U.ceilBy(LEAF_SIZE, vx1)
      , by1 = U.ceilBy(LEAF_SIZE, vy1)
      , width  = bx1 - bx0
      , height = by1 - by0
      , {sizeCoefficient, leafDerived} = LeafNew({maxSteps})
      , rootDerived = {
          sizeCoefficient,
          offsetPerRow: width * sizeCoefficient / LEAF_SIZE,
          viewportWidth: vx1 - vx0,
          xPadding: vx0 - bx0,
          yPadding: vy0 - by0,
          bx0,
          by0
        }
      , buffer = new Int32Array(width * height * sizeCoefficient / LEAF_SIZE)
      , blurBuffer = {
          viewport,
          maxSteps,
          buffer,
          leafDerived,
          rootDerived
        }
    return blurBuffer
  }
}

let {floor} = Math