import {SIZE} from "./leaf"
import {QUADRANTS} from "./direction"

export let Branch = ({Recur}) =>
  (ctx, a, b) => QUADRANTS.every(i => Recur(ctx, a[i], b[i]))

export let Edge = (ctx, a, b) =>
  typeof a === 'number'
    ? a === b
    : a[0] === b[0] && a[1] === b[1]

export let Leaf = (ctx, a, b) => {
  for (let i = 0; i < SIZE; i++)
    if (a[i] !== b[i]) return false
  
  return true
}

export let Neighborhood = (ctx, a, b) => {
  if (a.node !== b.node) return false

  for (let i = 0; i < 4; i++)
    if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
      return false

  return true
}