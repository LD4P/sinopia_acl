import { WebAccessControl } from '../src/webAccessControl'
import fs from 'fs'

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

  it('no need to call parseWac when wac string passed in constructor', () => {
    const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
    expect(wac.hasUser('http://sinopia.io/users/cmharlow')).toBeTruthy()
    expect(myWac.hasUser('http://example.com/nobody')).toBeFalsy()
  })

  describe('hasUser()', () => {
    describe('ttl fixture', () => {
      beforeAll(() => {
        myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      })

      it('true when user has access', () => {
        expect(myWac.hasUser('http://sinopia.io/users/cmharlow')).toBeTruthy()
      })
      it('false when user does not have access', () => {
        expect(myWac.hasUser('http://example.com/nobody')).toBeFalsy()
      })
    })

    it('false when the wac has no users (does not error)', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(myWac.hasUser('http://example.com/nobody')).toBeFalsy()
    })
    it('false when the wac is an empty string', () => {
      myWac.parseWac('')
      expect(myWac.hasUser('http://example.com/nobody')).toBeFalsy()
    })
    it('false when no wac is parsed', () => {
      const wac = new WebAccessControl()
      expect(wac.hasUser('http://example.com/nobody')).toBeFalsy()
    })
  })

  describe('listUsers()', () => {
    it('lists the webids of the users', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      expect(myWac.listUsers()).toEqual(['http://sinopia.io/users/cmharlow'])

      myWac.parseWac(fs.readFileSync(`${fixture_dir}/stanfordGroupAcl_2Users.ttl`).toString())
      expect(myWac.listUsers()).toContain('http://sinopia.io/users/cmharlow')
      expect(myWac.listUsers()).toContain('http://sinopia.io/users/suntzu')
    })

    it('empty array when the wac has no users (does not error)', () => {
      const wac = new WebAccessControl()
      wac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(wac.listUsers()).toEqual([])
    })
    it('empty array when the wac is an empty string', () => {
      const wac = new WebAccessControl()
      wac.parseWac('')
      expect(wac.listUsers()).toEqual([])
    })
    it('empty array when no wac is parsed', () => {
      const wac = new WebAccessControl()
      expect(wac.listUsers()).toEqual([])
    })
  })

  describe('validates()', () => {
    it('throws error when there is no acl:accessTo predicate', () => {
      const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/noAccessToPredicate.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: no http://www.w3.org/ns/auth/acl#accessTo predicate')
    })
    it('throws error when there is no acl:agentClass predicate', () => {
      const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/noAgentClassPredicate.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: no http://www.w3.org/ns/auth/acl#agentClass predicate')
    })
    it('throws error when there is no acl:mode acl:Read predicate-object pair', () => {
      const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/noAclReadIncluded.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: no http://www.w3.org/ns/auth/acl#Read permissions')
    })
    it('throws error when a group has no acl:agent predicate', () => {
      const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/noGroupUsers.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids')
    })
    it('returns true when this.n3store root container contents pass validates', () => {
      const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
      wac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
    })
    it('returns true when this.n3store group container contents pass validates', () => {
      const wac = new WebAccessControl(fs.readFileSync(`${fixture_dir}/stanfordGroupAcl_2Users.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
    })
  })
})
