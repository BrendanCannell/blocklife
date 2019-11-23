export default ({Allocate}) =>
  function EdgeNew(e0, e1) {
    let raw = Allocate()
    raw[0] = e0
    raw[1] = e1
    return raw
  }