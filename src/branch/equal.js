export default function BranchEqual(a, b) {
  for (let i = 0; i < 4; i++)
    if (a[i] !== b[i]) return false
  return true
}