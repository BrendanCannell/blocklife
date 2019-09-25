import {Var} from "@brendancannell/dysc"

export let Canon = {
  Branch: Var('Canon/Branch'),
  Edge: Var('Canon/Edge'),
  Leaf: Var('Canon/Leaf'),
  Neighborhood: Var('Canon/Neighborhood')
}

export let Malloc = {
  Branch: Var('Malloc/Branch'),
  Edge: Var('Malloc/Edge'),
  Leaf: Var('Malloc/Leaf'),
  Neighborhood: Var('Malloc/Neighborhood')
}

export let CopyMemoTable = Var('CopyMemoTable')