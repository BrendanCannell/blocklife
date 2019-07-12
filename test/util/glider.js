import Block from "../../src/block"
import Node from "../../src/node"
import Grid from "../../src/grid"
import {order} from "./life"
let glider = [[0,2], [1,2], [2,2], [2,1], [1,0]].sort(order)
let Glider = ([dx, dy]) => glider.map(([x, y]) => [x + dx, y + dy]).sort(order)

let eb = Block.EMPTY

let B = offset => {
  let b = eb

  for (let loc of Glider(offset)) b = b.set(loc, true)

  return b.sync()
}

let en = Node.Empty(null, 64, [eb, eb, eb, eb])

let N = offset => {
  let n = en

  for (let loc of Glider(offset)) n = n.set(loc, true)

  return n.sync()
}

let G = offset => Grid({Block, Node, alive: Glider(offset)})

export {glider, Glider, B as Block, N as Node, G as Grid}