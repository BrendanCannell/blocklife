function make(size, rows, ownerID) {
  let life = Object.create(Life.prototype)
  life.size = size
  life._rows = rows
  life.__ownerID = ownerID
  life.__altered = false
  return life
}

let EMPTY = make(0, [])

function Life(alive) {
  return EMPTY.merge(alive)
}

function copy({size, _rows}, ownerID) {
  let newRows = []
  for (let y in _rows)
    newRows[y] = _rows[y].slice()
  return make(size, newRows, ownerID)
}

function has(life, key) {
  if (!isLocation(key)) return false
  let [x, y] = key
  return y in life._rows && x in life._rows[y]
}

function get(life, key, notFoundValue) {
  if (!has(life, key)) return notFoundValue

  let [x, y] = key
  return life._rows[y][x]
}

function mergeIntoWith(state, life, ...lifes) {
  return life.withMutations(life => {
    for (let l of lifes)
      for (let location of l)
        set(life, location, state)
  })
}

function set(life, location, newValue) {
  let have = has(life, location)
  if (have && (newValue === get(life, location))) return life

  let [x, y] = location
  let l = life.__ownerID ? setAltered(life) : copy(life)
  
  let row = l._rows[y] || (l._rows[y] = [])
  row[x] = newValue
  if (!have) l.size++
  return l
}

function remove(life, location) {
  if (!has(life, location)) return life
  let l = life.__ownerID ? setAltered(life) : copy(life)

  let [x, y] = location
  delete l._rows[y][x]
  if (isEmpty(l._rows[y])) delete l._rows[y]
  l.size--
  return l
}

function update(life, location, xf, notFoundValue) {
  let currentValue = get(life, location, notFoundValue)
  let newValue = xf(currentValue, location, life)
  return set(life, location, newValue)
}

Life.union = ([...lifes]) => EMPTY.union(...lifes)
Life.intersect = ([first, ...rest]) => Life(first).intersect(...rest)

Life.prototype.add = function(location) {
  return set(this, location, true)
}

Life.prototype.clear = function() {
  if (!this.__ownerID) return EMPTY
  if (isEmpty(this._rows)) return this

  this._rows = []
  return setAltered(this)
}

Life.prototype.concat =
Life.prototype.merge =
Life.prototype.union = function(...ls) {
  return mergeIntoWith(true, this, ...ls)
}

Life.prototype.contains =
Life.prototype.has =
Life.prototype.includes = function(location) {
  return has(this, location)
}

Life.prototype.delete =
Life.prototype.remove = function(location) {
  return set(this, location, undefined, true)
}

Life.prototype.filter = function(predicate, context) {
  if (this.__ownerID) {
    for (let [location, value] of this.entries()) {
      let keep = predicate.call(context, value, location, this)
      if (!keep) remove(this, location, value)
    }

    return this
  }
  else return EMPTY.withMutations(filtered => {
    for (let [location, value] of this.entries()) {
      let keep = predicate.call(context, value, location, this)
      if (keep) set(filtered, location, value)
    }
  })
}

Life.prototype.flatMap = function(xf, context) {
  return EMPTY.withMutations(flatMapped => {
    for (let [location, value] of this.entries()) {
      let newEntries = xf.call(context, value, location, this)
      for (let [newLocation, newValue] of newEntries) {
        if (!isLocation(newLocation)) throw Error("Expected a location: " + newLocation)
        set(flatMapped, newLocation, newValue)
      }
    }
  })
}

Life.prototype.get = function(key, notSetValue) {
  return has(this, key) ? key : notSetValue
}

Life.prototype.getIn = function(keyPath, notSetValue) {
  for (let key of keyPath)
    return this.get(key, notSetValue)
  return this
}

Life.prototype.hasIn = function(keyPath) {
  return !!this.getIn(keyPath)
}

Life.prototype.intersect = function(...ls) {
  let inEvery = (_, location) =>
    ls.every(l => has(l, location))

  return this.filter(inEvery)
}

Life.prototype.map = function(xf, context) {
  return this.withMutations(mapped => {
    for (let [location, value] of mapped.entries()) {
      let newValue = xf.call(context, location, value, mapped)
      set(mapped, location, newValue)
    }
  })
}

Life.prototype.mapKeys = function(xf, context) {
  return EMPTY.withMutations(mapped => {
    for (let location of this.keys()) {
      let value = get(this, location)
      let newLocation = xf.call(context, location, value, this)
      if (!isLocation(newLocation)) throw Error("Expected a location: " + newLocation)
      set(mapped, newLocation, value)
    }
  })
}

Life.prototype.step = function() {
  return this.withMutations(life => {
      for (let [[x, y], value] of life.entries()) {
        if (value < 0) continue

        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (dx || dy)
              update(life, [x + dx, y + dy], n =>
                  !n    ? -1
                : n > 0 ? ++n
                :         --n)
      }
      life.filter(n => [3, 4, -3].includes(n))
      life.map(() => true)
    })
}

Life.prototype.subtract = function(...ls) {
  return mergeIntoWith(false, this, ...ls)
}

Life.prototype.toJS = 
Life.prototype.toJSON = function() {
  let array = []
  for (let y in this._rows)
    for (let x in this._rows[y])
      array.push([[x, y], this._rows[y][x]])
  return array
}

Life.prototype.entries = function*() {
  for (let yStr in this._rows) {
    let y = parseInt(yStr)
    let row = this._rows[y]

    for (let xStr in row) {
      let x = parseInt(xStr)

      yield [[x, y], row[x]]
    }
  }
}

Life.prototype.keys = function*() {
  for (let yStr in this._rows) {
    let y = parseInt(yStr)

    for (let xStr in this._rows[y])
      yield [parseInt(xStr), y]
  }
}

function OwnerID() {}

function setAltered(life) {
  life.__altered = true
  return life
}

Life.prototype.withMutations = function(fn) {
  let mutable = this.asMutable()
  fn(mutable)
  return mutable.wasAltered()
    ? mutable.__ensureOwner(this.__ownerID)
    : this
}

Life.prototype.asMutable = function() {
  return this.__ownerID
    ? this
    : this.__ensureOwner(new OwnerID())
}

Life.prototype.asImmutable = function() {
  return this.__ensureOwner()
}

Life.prototype.wasAltered = function() {
  return this.__altered
}

Life.prototype.__ensureOwner = function(ownerID) {
  if (ownerID === this.__ownerID)
    return this
  else if (!ownerID) {
    // `mutable.__ensureOwner()` -> change to immutable
    if (this.size === 0)
      return EMPTY
    else {
      this.__ownerID = ownerID
      this.__altered = false
      return this
    }
  }
  // make own copy
  else return copy(this, ownerID)
}

let isEmpty = array => !array.some(x => x)
let isInteger = x => parseFloat(x) === parseInt(x)
let isLocation = maybeLocation =>
  Array.isArray(maybeLocation)
  && maybeLocation.length === 2
  && maybeLocation.map(isInteger)

export default Life