import Node from "../src/node"
import Block from "../src/block"
import Grid from "../src/grid"
import {assert} from 'chai'
import seedrandom from 'seedrandom'
import {next, order} from "./util/life"
import * as G from "./util/glider"

describe("Grid", () => {
  it("can be constructed from a glider and recovered", () => {
    let g = G.Grid([0, 0])

    assert.deepEqual([...g.alive()].sort(order), G.glider)
  })

  it("can be constructed from a glider on a boundary and recovered", () => {
    let offset = [30, 30]
    let g = G.Grid(offset)

    assert.deepEqual([...g.alive()].sort(order), G.Glider(offset))
  })

  it("can be iterated with a glider correctly", () => {
    let offset = [20, 20]
    let g = G.Grid(offset)

    for (let i = 0; i < 80; i++) g.next()

    assert.deepEqual([...g.alive()].sort(order), G.Glider([40, 40]))
  })
})