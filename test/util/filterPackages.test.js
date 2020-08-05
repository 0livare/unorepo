const filterPackages = require('../../src/util/filterPackages')

describe('filterPackages', () => {
  const infos = [
    {
      name: 'package-a',
      version: '1.0.0',
      private: false,
      location: '/path/packages/package-a',
    },
    {
      name: 'package-b',
      version: '1.0.0',
      private: false,
      location: '/path/packages/package-b',
    },
  ]

  describe('when passing no packageName', () => {
    it('should return the same infos', () => {
      const packageName = null

      const result = filterPackages(packageName, infos)

      expect(result).toStrictEqual(infos)
    })
  })

  describe('when passing packageName', () => {
    it('should return the only packageName', () => {
      const packageName = 'package-a'

      const result = filterPackages(packageName, infos)

      expect(result.length).toBe(1)
      expect(result[0]).toStrictEqual(infos[0])
    })
  })
})
