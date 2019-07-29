import {SIZE} from "./leaf"

export let Branch = () => {
  let branch = [null, null, null, null]

  branch.size = 0
  branch.hash = 0
  branch.edges = [null, null, null, null]
  branch.corners = [0, 0, 0, 0]

  return branch
}

export let Edge = () => [null, null]

export let Leaf = () => {
  let leaf = new Int32Array(SIZE + 1)

  leaf.size = SIZE
  leaf.hash = 0
  leaf.edges = [0, 0, 0, 0]
  leaf.corners = [0, 0, 0, 0]

  return leaf
}

export let Neighborhood = () => ({
  node: null,
  edges: [null, null, null, null],
  corners: [0, 0, 0, 0],
  next: null
})