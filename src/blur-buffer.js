import * as U from "./util"
import Fix from "./fix-tree"

export default ({Branch, Leaf, LEAF_SIZE}) => {
  let Add = Fix(LEAF_SIZE)({Branch: Branch.Add, Leaf: Leaf.Add})
    , {New: LeafNew, Get: LeafGet} = Leaf

  return {Add, New, Draw}
  
  function Draw(colors, blurData, drawData) {
    let {offsetPerRow, sizeCoefficient, viewportWidth, xPadding, yPadding, bx0, by0} = blurData.rootDerived
      , dd = drawData
      , image = dd.data
      , iWidth = dd.width | 0
      , iHeight = dd.height | 0
      , scale = iWidth / viewportWidth
    bx0 |= 0; by0 |= 0;
    for (let iy = 0; iy < iHeight; iy++) {
      let gy = iy / scale + yPadding | 0 // Truncation required
        , ly = U.floorBy(LEAF_SIZE, gy) | 0
        , dy = gy - ly
        , iRowOffset = iy * iWidth | 0
      for (let ix = 0; ix < iWidth; ix++) {
        let gx = ix / scale + xPadding | 0 // Truncation required
          , lx = U.floorBy(LEAF_SIZE, gx) | 0
          , dx = gx - lx
          , leafOffset = (lx - bx0) * sizeCoefficient + (ly - by0) * offsetPerRow
          , blur = LeafGet(leafOffset, dx, dy, blurData)
        image[iRowOffset + ix] = colors[blur]
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
      , size = Math.max(width, height)
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
      , buffer = new Int32Array(size * size * sizeCoefficient / LEAF_SIZE)
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