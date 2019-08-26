import {AscXGroupedByDescY as order} from "./util/location"
import Glider from "./util/glider"
import Life from "../src/life"

export function testMarshalGlider(t) {
  for (let direction in Glider) {
    let glider = Glider[direction](-4)
      , actual = [...Life(glider).values()].sort(order)
    t.assert(actual == glider, 'marshal/unmarshall a glider')
  }
}

export function testMoveGlider(t) {
  for (let direction in Glider) {
    let count = 48
      , glider = Glider[direction](-count/2, [0,-5])
      , life = Life(glider)
    for (let i = 0; i < count; i++) {
      life = life.step()
    }
    let actual = [...life.values()].sort(order)
      , expected = Glider[direction](count/2, [0,-5])
    t.assert(actual == expected, 'move a glider across the origin')
  }
}

export function testMoveGliderMultistep(t) {
  for (let direction in Glider) {
    let count = 48
      , glider = Glider[direction](-count/2, [0,-5])
      , actual = [...Life(glider).step({count}).values()].sort(order)
      , expected = Glider[direction](count/2, [0,-5])
    t.assert(actual == expected, 'move a glider across the origin')
  }
}

export function testDrawGlider(t) {
  let viewport = {v0: [2, 2], v1: [6, 6]}
    , maxSteps = 2
    , blurBuffer =
        Life.BlurBuffer({viewport, maxSteps})
          .add(Life(Glider.SE(0, [2, 2])))
          .add(Life(Glider.SE(0, [3, 3])))
    , scale = 3
    , colors = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [2, 2, 2, 2]
      ]
    , width = 4 * scale
    , height = 4 * scale
    , data = blurBuffer.draw({
        colors,
        imageData: {
          data: new Uint8ClampedArray(width * height * 4),
          width,
          height
        }
      }).data
    , expected = [
        [0, 1, 0, 0],
        [0, 0, 2, 0],
        [1, 1, 1, 1],
        [0, 1, 1, 1],
      ]
      .map(line =>
        line
        .flatMap(n => Array(scale).fill(n))
        .flatMap(n => [n, n, n, n]))
      .flatMap(line => Array(scale).fill(line))
      .flat()
  t.assert([...data] == expected)
}