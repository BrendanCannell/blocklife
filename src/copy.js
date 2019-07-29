import {SIZE} from "./leaf"

export let Leaf = ({Malloc}) => (ctx, leaf) => {
  let raw = Malloc(ctx)

  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  return raw
}

export let Branch = ({Recur, Malloc}) =>
  (ctx, branch) => {
    let raw = Malloc(ctx)
    raw.size = branch.size

    for (let i = 0; i < 4; i++)
      raw[i] = Recur(ctx, branch[i])
    
    return raw
  }