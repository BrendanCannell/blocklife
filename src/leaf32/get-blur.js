import * as U from "../util"

export default ({maxSteps}) => {
  let divisionCount = U.ceilPow2(maxSteps) | 0
  for (var divisionToCellMask = 0, d = divisionCount; d--;)
    divisionToCellMask = divisionToCellMask | 1 << d
  
  return function GetBlur(buffer, leafOffset, dx, dy) {
    leafOffset |= 0; dx |= 0; dy |= 0;
    let rowOffset = leafOffset + dy * divisionCount | 0
      , columnOffset = 31 - dx
      , divIndex = columnOffset % divisionCount
      , divOffset = rowOffset + divIndex
      , div = buffer[divOffset]
      , divColumnOffset = U.floorBy(divisionCount, columnOffset)
      , blur = divisionToCellMask & (div >>> divColumnOffset)
    return blur
  }
}