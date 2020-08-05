const path = require('path')

const {
  changeExtensionsToGlobs,
  addFileGlobToPath,
} = require('../../src/util/globs')

describe('globs.addFileGlobToPath', () => {
  describe('when passing no globs', () => {
    it('should return null', () => {
      const globs = undefined
      const paths = ['/some/path/packages/package']

      const result = addFileGlobToPath(globs, paths)

      expect(result.length).toBe(1)
      expect(result[0]).toBe(paths[0])
    })
  })

  describe('when passing globs', () => {
    it('should join each of a number of globs to the end of a number of paths', () => {
      const globs = ['**/*.ts', '**/*.scss']
      const paths = ['some/path/packages/package']

      const result = addFileGlobToPath(globs, paths)

      expect(result.length).toBe(2)
      expect(result[0]).toBe(
        path.join('some', 'path', 'packages', 'package', '**', '*.ts'),
      )
    })
  })
})

describe('globs.changeExtensionsToGlobs', () => {
  describe('when passing no arguments', () => {
    it('should return null', () => {
      const args = undefined

      const result = changeExtensionsToGlobs(args)

      expect(result).toBe(null)
    })
  })

  describe('when passing arguments as an array of files extension', () => {
    it('should change strings from extension format to glob format', () => {
      const args = ['ts', 'scss']

      const result = changeExtensionsToGlobs(args)

      expect(result[0]).toBe('**/*.ts')
      expect(result[1]).toBe('**/*.scss')
    })
  })
})
