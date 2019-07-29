import {assert} from 'chai'
import Life from "../src/tiny-life"
import * as P from "../src/pattern"

describe('tiny-life', () => {
  it('iterates a glider', () => {
    let d = 10

    let SE_stepped = Life(P.gliderSE).withMutations(glider => {
      for (let i = 0; i < d * 4; i++)
        glider.step()
    })
    
    let SE_translated = Life(P.gliderSE.map(([x, y]) => [x + d, y + d]))
    
    assert.deepEqual(SE_stepped.toJS(), SE_translated.toJS())
  })
})

