export function LeafNext(leaf, N, S, W, E, NW, NE, SW, SE) {
  leaf |= 0; N |= 0; S |= 0; W |= 0; E |= 0; NW |= 0; NE |= 0; SW |= 0; SE |= 0;
  let L = leaf
    , familyCountN = (FamilyCount(NW, N, NE) & SOUTH_EDGE) << 24
    , familyCount  =  FamilyCount(W,  L, E)
    , familyCountS = (FamilyCount(SW, S, SE) >>> 24) & SOUTH_EDGE
    , neighborhoodCountOdd  = PartialNeighborhoodCount(familyCountN, familyCount, familyCountS, 0)
    , neighborhoodCountEven = PartialNeighborhoodCount(familyCountN, familyCount, familyCountS, 2)
    , nextOdd  = PartialNext(leaf, neighborhoodCountOdd)
    , nextEven = PartialNext(leaf >>> 2, neighborhoodCountEven)

  return nextOdd | (nextEven << 2)
  
  function FamilyCount(W, L, E) {
    let eastSibling = (L <<  2) & ~EAST_EDGE | (E >>> 6) & EAST_EDGE
    let westSibling = (L >>> 2) & ~WEST_EDGE | (W <<  6) & WEST_EDGE
    return L + westSibling + eastSibling
  }
  
  function PartialNeighborhoodCount(familyCountN, familyCount, familyCountS, shift) {
    familyCountN >>>= shift; familyCount >>>= shift; familyCountS >>>= shift;
    familyCountN &=   ODD;   familyCount &=   ODD;   familyCountS &=   ODD;
    let neighborhoodCount =
        (familyCount >>> 8) + familyCountN
      + familyCount
      + (familyCount <<  8) + familyCountS
    return neighborhoodCount
  }

  function PartialNext(leaf, neighborhoodCount) {
    leaf &= ODD
    let nc0 = neighborhoodCount - leaf
      , next0 = nc0 | leaf
      , nc1 = nc0 >>> 1
      , next1 = next0 & nc1
      , nc2 = nc1 >>> 1
      , next2 = next1 & ~nc2
    return next2 & BITS_4
  }
}