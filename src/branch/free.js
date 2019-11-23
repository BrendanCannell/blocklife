export default function BranchFree(branch) {
  // for (let i = 0; i < 4; i++) {
  //   branch[i] = null
  //   branch.edges[i] = null
  //   branch.corners[i] = 0
  // }
  branch.size = NaN
  branch.hash = NaN
  branch.population = NaN
  return branch
}