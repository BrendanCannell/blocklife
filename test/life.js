() => {
  describe('Life', () => {
    it('marshals/unmarshalls a glider', () => {
      assert.isTrue(L.EqualSet(Life(gliderNW).living(), gliderNW))
    })

    it('moves a glider across the origin', () => {
      assert.isTrue(L.EqualSet(
        Life(gliderNW).next({steps: 4}).living(),
        gliderNW.map(translate([-1, -1]))))
    })
  })
}