# lowlife
An implementation of Conway's Game of Life. Work-in-progress highly unstable interfaces may change without warning use at your own risk here there be dragons.

## Usage
`lowlife`'s data model is based on (immutable) sets of Cartesian coordinate pairs, which represent the locations of all living cells on the grid.

```js
import * as Life from 'lowlife'

//  . O .
//  . . O   glider (origin at top left)
//  O O O

let glider = Life.FromLiving([[1,0], [2,1], [0,2], [1,2], [2,2]])
let iteratedGlider = glider
for (let i = 0; i < 4; i++)
  iteratedGlider = Life.Next(iteratedGlider)

assert(
  JSON.stringify([...Life.Living(iteratedGlider)])
  ===
  JSON.stringify([...Life.Living(glider)].map(([x, y]) => [x + 1, y + 1]))
)
```

The `Next` function can optionally reuse a grid's memory when constructing its successor. Any operations on the original grid after using this option will throw an exception:

```js
let glider = Life.FromLiving([[1,0], [2,1], [0,2], [1,2], [2,2]])
let iteratedGlider = glider
for (let i = 0; i < 4; i++)
  iteratedGlider = Life.Next(iteratedGlider, {canFree: true}) // <- Tells `Next` to reuse its argument's memory

assert(
  JSON.stringify([...Life.Living(iteratedGlider)])
  ===
  JSON.stringify([...Life.Living(glider)].map(([x, y]) => [x + 1, y + 1]))
)
```

This time `Living(glider)` throws a TypeError. Since `iteratedGlider` was initially an alias of `glider`, `glider` was revoked after the first call to `Next`

## Architecture
Modules, in ascending order of abstraction:
* `branch` and `leaf` provide quadtree operations for their respective subtypes
* `tree` assembles them (while applying canonicalization/memoization transforms) to provide full quadtree operations
* `grid` embeds a quadtree in the coordinate plane, growing when needed to simulate infinite size
* `life` provides memory management