import * as U from "./util"

import {Canon, Allocate} from "./context"

export default function LetStore(store, fn) {
  let BranchAllocate       = store.Branch.Allocate
  let EdgeAllocate         = store.Edge.Allocate
  let LeafAllocate         = store.Leaf.Allocate
  let NeighborhoodAllocate = store.Neighborhood.Allocate
  let BranchCanon          = store.Branch
  let EdgeCanon            = store.Edge
  let LeafCanon            = store.Leaf
  let NeighborhoodCanon    = store.Neighborhood

  return (
    Allocate.Branch      .let(BranchAllocate,       () =>
    Allocate.Edge        .let(EdgeAllocate,         () =>
    Allocate.Leaf        .let(LeafAllocate,         () =>
    Allocate.Neighborhood.let(NeighborhoodAllocate, () =>
    Canon   .Branch      .let(BranchCanon,          () =>
    Canon   .Edge        .let(EdgeCanon,            () =>
    Canon   .Leaf        .let(LeafCanon,            () =>
    Canon   .Neighborhood.let(NeighborhoodCanon,
      fn))))))))
  )
}