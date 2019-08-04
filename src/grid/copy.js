import {SIZE} from "../leaf"

export let Leaf = function CopyLeaf(ctx, leaf) {
  let raw = ctx.Leaf.Malloc()

  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  return raw
}

export let Branch = ({Recur}) => function CopyBranch(ctx, branch) {
  let raw = ctx.Branch.Malloc()
  raw.size = branch.size

  for (let i = 0; i < 4; i++)
    raw[i] = Recur(ctx, branch[i])
  
  return raw
}