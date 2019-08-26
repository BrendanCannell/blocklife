import SetOne from "./set-one"

export function Set(leaf, pairs) {
  return locations.reduce((leaf, [loc, state]) => SetOne(leaf, loc, state), leaf)
}