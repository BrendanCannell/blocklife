import Substore from "./substore"
import * as Malloc from "../malloc"
import Grid from "../grid"
import * as U from "../util"

let Substores = U.map(Substore)(U.zip({Malloc, Copy: Grid.Copy}))

export default function Store() {
  let substores = U.map(S => S())(Substores)
  let Clear = () => U.map(S => S.Clear())(substores)
  let Show = () => U.map(S => S.Show())(substores)
  return {...substores, Clear, Show}
}