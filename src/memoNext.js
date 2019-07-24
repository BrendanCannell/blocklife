import * as H from "./hash"

export let Malloc = () => ({
  hash: 0,
  next: null,

  center: null,
  north: null,
  south: null,
  west: null,
  east: null,
  northwest: null,
  northeast: null,
  southwest: null,
  southeast: null,
})

export let MemoNext = ({
    Next,
    Equal,
    Malloc: M = Malloc,
    Free = () => {},
    memoTable
  }) => (...args) => {
    let memo = New(M(), ...args)

    let memoized = memoTable.get(memo.hash)

    if (memoized) {
      let eq = MemoEqual(memo, memoized, Equal)

      Free(memo)

      if (eq) return memoized.next; else console.error("Collision!")
    }
    
    let next = Next(...args)
    
    if (!memoized) {
      memo.next = next
      memoTable.set(memo.hash, memo)
    }

    return next
  }

let New = (raw, center, north, south, west, east, northwest, northeast, southwest, southeast) => {
  raw.center = center
  raw.north = north
  raw.south = south
  raw.east = east
  raw.west = west
  raw.northwest = northwest
  raw.northeast = northeast
  raw.southwest = southwest
  raw.southeast = southeast

  raw.hash = H.of(
    center.hash,
    north.south,
    south.north,
    west.east,
    east.west,
    northwest.southeast,
    northeast.southwest,
    southwest.northeast,
    southeast.northwest
  )

  return raw
}

let MemoEqual = (mb1, mb2, Equal) =>
      mb1.north    .south     === mb2.north    .south
  && mb1.south    .north     === mb2.south    .north
  && mb1.east     .west      === mb2.east     .west
  && mb1.west     .east      === mb2.west     .east
  && mb1.northwest.southeast === mb2.northwest.southeast
  && mb1.northeast.southwest === mb2.northeast.southwest
  && mb1.southwest.northeast === mb2.southwest.northeast
  && mb1.southeast.northwest === mb2.southeast.northwest
  && Equal(mb1.center, mb2.center)