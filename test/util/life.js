// Naive reference implementation of Life

import {AscXGroupedByDescY} from "./location"
export {AscXGroupedByDescY as order}

export let neighborhood = ([x, y]) => [
  [x-1, y+1], [x, y+1], [x+1, y+1],
  [x-1, y  ],           [x+1, y  ],
  [x-1, y-1], [x, y-1], [x+1, y-1]
]

export let next = liveCells => {
  let isAlive = cell => liveCells.find(c => 0 === order(c, cell))

  var neighbors =
        liveCells
        .flatMap(neighborhood)
        .sort(order)

  var next = []

  while (neighbors.length) {
    let cell = neighbors.shift()
    var count = 1

    while (neighbors[0] && 0 === order(cell, neighbors[0])) {
      neighbors.shift()
      count++
    }

    if (count === 3 || (count === 2 && isAlive(cell)))
      next.push(cell)
  }

  return next.sort(order)
}

export default next