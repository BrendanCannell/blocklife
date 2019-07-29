import {assert} from 'chai'
import isLeaf from "../src/isLeaf"
import * as L from "../src/leaf"
import * as B from "../src/branch"

describe('isLeaf', () => {
  it('isLeaf(Leaf.Malloc()) -> true', () => {
    assert.isTrue(isLeaf(L.Malloc()))
  })
  it('isLeaf(Branch.Malloc()) -> false', () => {
    assert.isFalse(isLeaf(B.Malloc()))
  })
})