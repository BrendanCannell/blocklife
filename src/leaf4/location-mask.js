export function Mask(x, y) {
  if (x < 0 || x >= 4 || y < 0 || y >= 4)
    throw Error(`Out of bounds: [${x}, ${y}]`)
  return 1 << 30 - 2*x - 8*y
}