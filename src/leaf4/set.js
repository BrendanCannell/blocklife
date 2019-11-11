import SetOne from "./set-one"

export default function Set(leaf, pairs) {
  for (var [loc, state] of pairs)
    leaf = SetOne(leaf, loc, state)
  return leaf
}