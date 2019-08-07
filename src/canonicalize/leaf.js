import CanonicalizeConstructor from "./constructor"
import * as U from "../util"
let Canonicalizable = {EqualLeaf, HashLeaf, SetDerivedLeaf}
export default CanonicalizeConstructor('Leaf', U.stripRight('Leaf')(Canonicalizable))

function EqualLeaf(a, b) {
  for (let i = 0; i < SIZE; i++)
    if (a[i] !== b[i]) return false
  
  return true
}

import {ofArray} from "../fnv-hash"
function HashLeaf(leaf) {
  return ofArray(leaf)
}

import * as D from "../direction"
import {SIZE, WEST_EDGE, EAST_EDGE} from "../leaf"
function SetDerivedLeaf(ctx, leaf, hash) {
  leaf.hash = hash

  var west = 0
  var east = 0
  var population = 0

  for (let i = 0; i < SIZE; i++) {
    let row = leaf[i]
    
    west |= (row & WEST_EDGE) >>> i
    east |= (row & EAST_EDGE) <<  31 - i

    population += Population(row)
  }

  leaf.edges[D.N] = leaf[0]
  leaf.edges[D.S] = leaf[31]
  leaf.edges[D.W] = west
  leaf.edges[D.E] = east
  
  leaf.corners[D.NW] = west >>> 31
  leaf.corners[D.NE] = east >>> 31
  leaf.corners[D.SW] = west & 1
  leaf.corners[D.SE] = east & 1

  leaf.population = population

  return leaf
}

// Number of set bits in a U32. See "Hacker's Delight" chapter 5
function Population(x) {
  x = (x & 0x55555555) + (x >>> 1  & 0x55555555)
  x = (x & 0x33333333) + (x >>> 2  & 0x33333333)
  x = (x & 0x0F0F0F0F) + (x >>> 4  & 0x0F0F0F0F)
  x = (x & 0x00FF00FF) + (x >>> 8  & 0x00FF00FF)
  x = (x & 0x0000FFFF) + (x >>> 16 & 0x0000FFFF)

  return x | 0
}