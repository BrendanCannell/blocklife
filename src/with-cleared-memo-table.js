export default function WithClearedMemoTable(memoTable) {
  return Fn => function WithClearedMemoTable(...args) {
    memoTable.clear()
    return Fn(...args)
  }
}