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
      life = life.step()
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
      , actual = [...Life(glider).step({count}).values()].sort(order)
      , expected = Glider[direction](count/2, [0,-5])
    t.assert(actual == expected, 'move a glider across the origin')
  }
}

// export function testDrawGlider(t) {
//   let x0 = 23
//     , y0 = 23
//     , width = 4
//     , height = 4
//     , viewport = {v0: [x0, y0], v1: [x0 + width, y0 + height]}
//     , maxSteps = 2
//     , blurBuffer =
//         Life.BlurBuffer({width, height, maxSteps})
//           .add(Life(Glider.SE(0, [x0    , y0    ])), viewport)
//           .add(Life(Glider.SE(0, [x0 + 1, y0 + 1])), viewport)
//     , scale = 3
//     , scaledWidth = width * scale
//     , scaledHeight = height * scale
//     , imageData = {
//         data: new Uint8ClampedArray(scaledWidth * scaledHeight * 4),
//         width: scaledWidth,
//         height: scaledHeight
//       }
//     , colors = [
//         [0, 0, 0, 0],
//         [1, 1, 1, 1],
//         [2, 2, 2, 2]
//       ]
//     , data = blurBuffer.draw(imageData, colors, viewport).data
//     , expected = [
//         [0, 1, 0, 0],
//         [0, 0, 2, 0],
//         [1, 1, 1, 1],
//         [0, 1, 1, 1],
//       ]
//       .map(line =>
//         line
//         .flatMap(n => Array(scale).fill(n))
//         .flatMap(n => [n, n, n, n]))
//       .flatMap(line => Array(scale).fill(line))
//       .flat()
//   t.assert([...data] == expected)
// }

export function testDrawGlider(t) {
  process.debug = true
  let x0 = -3
    , y0 = -3
    // , width = 128
    // , height = 128
    // , viewport = {v0: [-64, -64], v1: [-64 + width, -64 + height]}
    , width = 7
    , height = width
    , v0 = [x0 - 2, y0 - 2]
    , v1 = [v0[0] + width, v0[1] + height]
    , viewport = {v0, v1}
    , maxSteps = 2
    , glider1 = Life(Glider.SE(0, [x0    , y0    ]))
    , glider2 = Life(Glider.SE(0, [x0 + 1, y0 + 1]))
    , blurBuffer =
        Life.BlurBuffer({width, height, maxSteps})
          .add(glider1, viewport)
          .add(glider2, viewport)
    , scale = 1
    , scaledWidth = width * scale
    , scaledHeight = height * scale
    , imageData = {
        data: new Uint8ClampedArray(scaledWidth * scaledHeight * 4),
        width: scaledWidth,
        height: scaledHeight
      }
    , colors = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [2, 2, 2, 2]
      ]
    , data = blurBuffer.draw(imageData, colors, viewport).data
  //   , expected = [
  //       [0, 1, 0, 0],
  //       [0, 0, 2, 0],
  //       [1, 1, 1, 1],
  //       [0, 1, 1, 1],
  //     ]
  //     .map(line =>
  //       line
  //       .flatMap(n => Array(scale).fill(n))
  //       .flatMap(n => [n, n, n, n]))
  //     .flatMap(line => Array(scale).fill(line))
  //     .flat()
  // t.assert([...data] == expected)
  console.log({
    blurBuffer: [...blurBuffer.get().buffer].map((n, i) => n && [i, n]).filter(Boolean),
    data: [...data].filter((n, i) => i % 4 === 0).map((n, i) => n && [i % width, i / width | 0]).filter(Boolean)
  })
}