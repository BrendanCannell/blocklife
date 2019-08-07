import S from "./substore"
import * as Malloc from "./malloc"
import * as U from "../util"

let Substore = Malloc => S({
  Malloc,
  Copy: () => {throw Error("TODO Copy")}
})

let Substores = U.map(Substore)(Malloc)

function Store() {
  let substores = U.map(S => S())(Substores)
  let Clear = () => U.map(S => S.Clear())(substores)
  let Show = () => U.map(S => S.Show())(substores)

  return {...substores, Clear, Show}
}

export default Store