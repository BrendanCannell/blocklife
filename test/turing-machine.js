import Life from "../src/life"
import TM from "./util/turing-machine-10793"

export function testTuringMachine(t) {
  let life = Life(TM).step({count: 8, canFree: true})
}