import { WebAccessControl } from '../src/webAccessControl'
const N3 = require('n3')
const { DataFactory } = N3
const { namedNode } = DataFactory
// const { namedNode, literal, defaultGraph, quad } = DataFactory

const fs = require('fs')


describe('WebAccessControl', () => {
  const myWac = new WebAccessControl()
  const fixture_dir = '__tests__/__fixtures__'

  describe('parseWac', () => {
    it('errors when wac is jsonld', () => {
      expect(() => {
        myWac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.jsonld`).toString())
      }).toThrow('Expected entity but got literal')
    })
    it('no error when the arg is an empty string', () => {
      myWac.parseWac('')
    })
    it('no error when the arg is missing', () => {
      myWac.parseWac()
    })
  })

  describe('ttl fixture', () => {
    beforeAll(() => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
    })

    describe('hasUser()', () => {
      it('true when user has access', () => {
        expect(myWac.hasUser('http://sinopia.io/users/cmharlow')).toBeTruthy()
      })
      it('false when user does not have access', () => {
        expect(myWac.hasUser('http://example.com/nobody')).toBeFalsy()
      })

      it('false when the wac has no users (does not error)', () => {
        const wac = new WebAccessControl()
        wac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
        expect(wac.hasUser('http://example.com/nobody')).toBeFalsy()
      })
      it('false when the wac is an empty string', () => {
        const wac = new WebAccessControl()
        wac.parseWac('')
        expect(wac.hasUser('http://example.com/nobody')).toBeFalsy()
      })
      it('false when no wac is parsed', () => {
        const wac = new WebAccessControl()
        expect(wac.hasUser('http://example.com/nobody')).toBeFalsy()
      })
    })

  })

})
