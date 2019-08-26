import QUADRANTS from "./quadrants"

export default (location, size) => {
  let {index, offset: [dx, dy]} = Quadrant(location, size)
  let [x, y] = location
  return {index, location: [x - dx * size, y - dy * size]}
}

let InBounds = (x, size) => 0 <= x && x < size

let Quadrant = ([x, y], size) => {
  for (let Q of QUADRANTS) {
    let [dx, dy] = Q.offset
    if (InBounds(x - dx * size, size / 2) && InBounds(y - dy * size, size / 2))
      return Q
  }
  throw TypeError(`Out of bounds: location = ${[x, y]}, size = ${size}`)
}