import {SIZE} from "./constants"

export default () =>
  function LeafAddBlur(_size, drawBuffer, leaf, x, y) {
    let {buffer, divisionCount, LeafOffset, rowToDivisionMask} = drawBuffer
    divisionCount |= 0; rowToDivisionMask |= 0;
    let leafOffset = LeafOffset(x, y) | 0
    for (let y = 0; y < SIZE; y++) {
      let rowOffset = leafOffset + y * divisionCount | 0
      for (let d = 0; d < divisionCount; d++)
        buffer[rowOffset + d] += leaf[y] >>> d & rowToDivisionMask
    }
    return drawBuffer
  }