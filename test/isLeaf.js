import {assert} from 'chai'
import isLeaf from "../src/isLeaf"
import * as L from "../src/leaf"
import * as B from "../src/branch"

describe('isLeaf', () => {
  it('isLeaf(Leaf.Allocate()) -> true', () => {
    assert.isTrue(isLeaf(L.Allocate()))
  })
  it('isLeaf(Branch.Allocate()) -> false', () => {
    assert.isFalse(isLeaf(B.Allocate()))
  })
})