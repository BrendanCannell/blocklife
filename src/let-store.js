import * as U from "./util"

import {Canon, Malloc} from "./context"

export function letStore(store, fn) {
  let BranchMalloc       = store.Branch.Malloc
  let EdgeMalloc         = store.Edge.Malloc
  let LeafMalloc         = store.Leaf.Malloc
  let NeighborhoodMalloc = store.Neighborhood.Malloc
  let BranchCanon       = store.Branch
  let EdgeCanon         = store.Edge
  let LeafCanon         = store.Leaf
  let NeighborhoodCanon = store.Neighborhood

  return (
    Malloc.Branch      .let(BranchMalloc,       () =>
    Malloc.Edge        .let(EdgeMalloc,         () =>
    Malloc.Leaf        .let(LeafMalloc,         () =>
    Malloc.Neighborhood.let(NeighborhoodMalloc, () =>
    Canon .Branch      .let(BranchCanon,        () =>
    Canon .Edge        .let(EdgeCanon,          () =>
    Canon .Leaf        .let(LeafCanon,          () =>
    Canon .Neighborhood.let(NeighborhoodCanon,
      fn))))))))
  )
}