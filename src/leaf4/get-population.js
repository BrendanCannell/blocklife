// Number of set bits in a U32. See "Hacker's Delight" chapter 5
export default function LeafGetPopulation(leaf) {
  leaf = (leaf & 0x55555555) + (leaf >>> 1  & 0x55555555)
  leaf = (leaf & 0x33333333) + (leaf >>> 2  & 0x33333333)
  leaf = (leaf & 0x0F0F0F0F) + (leaf >>> 4  & 0x0F0F0F0F)
  leaf = (leaf & 0x00FF00FF) + (leaf >>> 8  & 0x00FF00FF)
  leaf = (leaf & 0x0000FFFF) + (leaf >>> 16 & 0x0000FFFF)
  return leaf | 0
}