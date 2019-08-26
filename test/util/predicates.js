import C  from 'rho-contracts'

export let equalLocations =
  C.pred(
    ([[x0, y0], [x1, y1]]) => x0 === x1 && y0 === y1
  )
  .rename('equal locations')

export let location =
  C.pred(
    x =>
      Array.isArray(x)
      && x.length === 2
      && integer(x[0])
      && integer(x[1])
  )
  .rename('location')

let integer = x => x === (x | 0)

export let numIn = 
  C.fun({min: C.number}, {max: C.number}).returns(
  C.fun({x: C.number}).returns(
        C.bool
  )).wrap(
    (min, max) => x => min <= x && x < max,

    'numIn'
  )

export let locationIn =
  C.fun({min: location}, {max: location}).returns(
  C.fun({location}).returns(
        C.bool
  )).wrap(
    
    ([minX, minY], [maxX, maxY]) => {
      let xIn = numIn(minX, maxX)
      let yIn = numIn(minY, maxY)

      return ([x, y]) => xIn(x) && yIn(y)
    },

    'locationIn'
  )