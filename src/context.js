import {Var} from "@brendancannell/dysc"

export let Canon = {
  Branch: Var('Canon/Branch'),
  Edge: Var('Canon/Edge'),
  Leaf: Var('Canon/Leaf'),
  Neighborhood: Var('Canon/Neighborhood')
}

export let Allocate = {
  Branch: Var('Allocate/Branch'),
  Edge: Var('Allocate/Edge'),
  Leaf: Var('Allocate/Leaf'),
  Neighborhood: Var('Allocate/Neighborhood')
}

export let CopyMemoTable = Var('CopyMemoTable')