export default function BranchMalloc() {
  let branch = [null, null, null, null]

  branch.size = 0
  branch.hash = 0
  branch.edges = [null, null, null, null]
  branch.corners = [0, 0, 0, 0]
  branch.population = 0

  return branch
}