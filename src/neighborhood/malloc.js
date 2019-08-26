export default function NeighborhoodMalloc() {
  return {
    node: null,
    neighbors: [null, null, null, null, null, null, null, null],
    edges: [null, null, null, null],
    corners: [0, 0, 0, 0],
    next: null
  }
}