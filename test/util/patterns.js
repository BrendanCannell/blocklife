import turingMachine from "./turing-machine"

// let fromPlaintext = str => {
//   let lines = [...str.match(/^[.O]+/mg)]
//     .map((line, y) =>
//       line
//         .split("")
//         .map((char, index) => char === "O" && [index, y])
//         .filter(Boolean))

//   return [].concat(...lines)
// }

let fromRLE = str => {
  let bodyMatch = str.toLowerCase().match(/^(?:#.*?\n)*(?:\s*x.*\n)([ob$\d\n\s]*)/i)
  if (!bodyMatch) throw Error("RLE body not found in string: " + str)

  let lines = bodyMatch[1].split("$")

  let livePairs = []
    , y = 0

  lines.forEach(line => {
    let runs = line.match(/\d*[bo]/g)
      , x = 0

    for (var run of runs) {
      let count = parseInt(run) || 1

      if (run.includes("o")) {
        for (let i = 0; i < count; i++) {
          livePairs.push([x, y])
          x++
        }
      } else x += count
    }

    let trailing = parseInt(line.match(/\d*$/)[0]) || 1
    y += trailing
  })

  return livePairs
}

export default {
  turingMachine: fromRLE(turingMachine)
}