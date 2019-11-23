export default function BranchAllocate() {
  let branch = [null, null, null, null]
  branch.size = NaN
  branch.hash = NaN
  branch.edges = [null, null, null, null]
  branch.corners = [0, 0, 0, 0]
  branch.population = NaN
  return branch
}