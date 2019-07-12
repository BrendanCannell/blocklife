function Grid({Node, Block, root, alive = []}) {
  if (!new.target) return new Grid(...arguments)

  this.Node = Node
  this.Block = Block

  let size = root && root.size || Block.SIZE * 2
  this.empty = []
  this.root = Node.Empty(this, size)
  
  for (let loc of alive)
    this.set(loc, true, false)

  return this.sync()
}

Grid.prototype.createDrawData = function(viewport, maxSteps) {
  let {v0: [vx0, vy0], v1: [vx1, vy1]} = viewport

  let x0 = floor32(vx0),
      y0 = floor32(vy0),
      x1 = ceil32(vx1),
      y1 = ceil32(vy1),
      width = x1 - x0,
      height = y1 - y0,
      size = Math.max(width, height),
      divisions = ceilPow2(maxSteps),
      cellOffset = divisions / 32,
      columnOffset = this.Block.SIZE * cellOffset,
      rowOffset = width * divisions / 32,
      data = new Int32Array(size * size * divisions / 32)

  return {
    v0: [x0, y0],
    v1: [x1, y1],
    width, height, size, divisions, data, viewport, maxSteps,
    Offset: (x, y) => (x - x0) * columnOffset + (y - y0) * rowOffset
  }
}

Grid.prototype.addTo = function(drawData) {
  let m = this.root.size / 2

  return this.root.addTo(drawData, -m, -m)
}

let ceilPow2 = n => Math.pow(Math.ceil(Math.log2(n)), 2)
let floor32 = n => Math.floor(n * 32) / 32
let ceil32 = n => Math.ceil(n * 32) / 32

Grid.prototype.getEmpty = function(size) {
  if (!this.empty[size]) {
    this.empty[size] =
      size === this.Block.SIZE ?
          this.Block.EMPTY
        : this.Node.Empty(this, size)
  }

  return this.empty[size]
}

Grid.prototype.toRootLoc = function([x, y]) {
  let d = this.root.size / 2
  let inRoot = -d <= x && x < d && -d <= y && y < d

  return inRoot && [x + d, y + d]
}

Grid.prototype.fromRootLoc = function([x, y]) {
  let d = this.root.size / 2

  return [x - d, y - d]
}

Grid.prototype.grow = function(north, south, west, east) {
  let r = this.root
  let s = r.size
  let e = this.getEmpty(s)

  let Node = this.Node

  north = (north || e).quadrants
  south = (south || e).quadrants
  west = (west || e).quadrants
  east = (east || e).quadrants 

  let NW = Node.NORTHWEST
  let NE = Node.NORTHEAST
  let SW = Node.SOUTHWEST
  let SE = Node.SOUTHEAST

  let center = this.root.quadrants
  let eChild = this.getEmpty(s / 2)

  this.root = Node(this, 2 * s, [
    Node(this, s, [
      eChild,
      north[SW],
      west[NE],
      center[NW]
    ]),
    Node(this, s, [
      north[SE],
      eChild,
      center[NE],
      east[NW]
    ]),
    Node(this, s, [
      west[SE],
      center[SW],
      eChild,
      south[NW]
    ]),
    Node(this, s, [
      center[SE],
      east[SW],
      south[NE],
      eChild
    ])
  ])

  return this
}

let drawOptions = {}
Grid.prototype.draw = function(imageBuffer, imageWidth, frameFraction, viewport) {
  let d = drawOptions
  d.imageBuffer = imageBuffer
  d.imageWidth = imageWidth
  d.imageHeight = imageBuffer.length / imageWidth
  d.scale = viewport.width / imageWidth
  d.frameFraction = frameFraction

  // The grid corners in the image coordinate system
  let m = this.root.size / 2
  let v = viewport

  let ix0 = (-m - v.x0) / v.width  * d.imageWidth
  let iy0 = (-m - v.y0) / v.height * d.imageHeight

  let ix1 = ((m - v.x1) / v.width  + 1) * d.imageWidth
  let iy1 = ((m - v.y1) / v.height + 1) * d.imageHeight

  this.root.draw(d, ix0, iy0, ix1, iy1)
}

Grid.prototype.get = function(pair) {
  let rootPair = this.toRootLoc(pair)

  return rootPair && this.root.get(rootPair)
}

Grid.prototype.alive = function*() {
  for (let loc of this.root.alive())
    yield this.fromRootLoc(loc)
}

Grid.prototype.set = function(loc, isAlive, sync = true) {
  let rootPair = this.toRootLoc(loc)

  // Grow as needed
  if (!rootPair) return this.grow().set(...arguments)

  this.root = this.root.set(rootPair, isAlive)

  if (sync) this.sync()

  return this
}

Grid.prototype.next = function() {
  let e = this.getEmpty(this.root.size)

  this.sync({hash: true, population: true})

  let opts = {sync: false}

  this.root = this.root.next(opts, e, e, e, e, e, e, e, e)

  let r = this.root

  let north = e.next(opts, e, r, e, e, e, e, e, e)
  let south = e.next(opts, r, e, e, e, e, e, e, e)
  let west = e.next(opts, e, e, e, r, e, e, e, e)
  let east = e.next(opts, e, e, r, e, e, e, e, e)

  if ([north, south, west, east].some(x => x !== e))
    this.grow(north, south, west, east)

  return this
}

Grid.prototype.sync = function(opts) {
  this.root = this.root.sync(opts)

  return this
}

export default Grid