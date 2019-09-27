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
    let count = 256
      , glider = Glider[direction](-count/2, [0,-5])
      , life = Life(glider)
    for (let i = 0; i < count; i++) {
      life = life.step({canMutate: true})
    }
    let actual = [...life.values()].sort(order)
      , expected = Glider[direction](count/2, [0,-5])
    t.assert(actual == expected, 'move a glider across the origin')
  }
}

export function testMoveGliderMultistep(t) {
  for (let direction in Glider) {
    let count = 256
      , glider = Glider[direction](-count/2, [0,-5])
      , actual = [...Life(glider).step({count, canMutate: true}).values()].sort(order)
      , expected = Glider[direction](count/2, [0,-5])
    t.assert(actual == expected, 'move a glider across the origin')
  }
}

export function testDrawGlider(t) {
  let x0 = 23
    , y0 = 23
    , width = 4
    , height = 4
    , left = x0
    , right = x0 + width
    , top = y0
    , bottom = y0 + height
    , viewport = {v0: [x0, y0], v1: [x0 + width, y0 + height], width, height, left, right, top, bottom}
    , glider1 = Glider.SE(0, [x0    , y0    ])
    , life1 = Life([])
  glider1.forEach(location => life1 = life1.add(location))
  let scale = 3
    , scaledWidth = width * scale
    , scaledHeight = height * scale
    , colors = {
        dead: [0, 0, 0, 0],
        alive: [1, 1, 1, 1]
      }
    , imageData2 = {
        data: new Uint8ClampedArray(scaledWidth * scaledHeight * 4),
        width: scaledWidth,
        height: scaledHeight
      }
    , data2 = life1.render({imageData: imageData2, viewport, colors}).data
    , expected2 = [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
      ]
      .map(line =>
        line
        .flatMap(n => Array(scale).fill(n))
        .flatMap(n => [n, n, n, n]))
      .flatMap(line => Array(scale).fill(line))
      .flat()
  t.assert([...data2] == expected2)
}