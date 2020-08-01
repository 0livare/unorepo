const splitList = require('../../src/util/splitList')

describe('splitList', () => {
  describe('when passing no arguments', () => {
    it('should return null', () => {
      const args = undefined
      const expected = []

      const result = splitList(args)

      expect(result).toStrictEqual(expected)
    })
  })

  describe('when passing one argument without separators', () => {
    it('should return array contains one item', () => {
      const args = 'ts'

      const result = splitList(args)

      expect(result.length).toBe(1)
    })
  })

  describe('when passing one argument with separators', () => {
    const expectedArray = ['ts', 'scss']

    it('should split commas to an array', () => {
      const args = 'ts,scss'

      const result = splitList(args)

      expect(result).toStrictEqual(expectedArray)
    })

    it('should split || to an array', () => {
      const args = 'ts||scss'

      const result = splitList(args)

      expect(result).toStrictEqual(expectedArray)
    })
  })
})
