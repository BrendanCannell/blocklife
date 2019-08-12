import {SIZE} from "../leaf"

export let Branch = ({Malloc, Recur: Copy}) =>
  function CopyBranch(size, branch) {
    let raw = Malloc()
    for (let i = 0; i < 4; i++)
      raw[i] = Copy(size/2, branch[i])
    return raw
  }

export let Leaf = ({Malloc}) =>
  function CopyLeaf(_size, leaf) {
    let raw = Malloc()
    for (let i = 0; i < SIZE; i++)
      raw[i] = leaf[i]
    return raw
  }