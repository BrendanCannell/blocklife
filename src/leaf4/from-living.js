import SetOne from "./set-one"

export function FromLiving(locations) {
  var leaf = 0
  for (let l of locations)
    leaf = SetOne(leaf, l, true)
  return leaf
}