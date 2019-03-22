import { WebAccessControl } from '../src/webAccessControl'
import fs from 'fs'
import N3 from 'n3'
const { DataFactory } = N3
const { namedNode } = DataFactory

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
    const wac = new WebAccessControl('', fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
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
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/noAccessToPredicate.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: no http://www.w3.org/ns/auth/acl#accessTo predicate')
    })
    it('throws error when there is no acl:agentClass predicate', () => {
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/noAgentClassPredicate.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: no http://www.w3.org/ns/auth/acl#agentClass predicate')
    })
    it('throws error when there is no acl:mode acl:Read predicate-object pair', () => {
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/noAclReadIncluded.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: no http://www.w3.org/ns/auth/acl#Read permissions')
    })
    it('throws error when a group has no acl:agent predicate', () => {
      const wac = new WebAccessControl('stanford', fs.readFileSync(`${fixture_dir}/noGroupUsers.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids')
    })
    it('throws error when group in constructor does not match object of acl:accessTo predicate', () => {
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/stanfordGroupAcl_2Users.ttl`).toString())
      expect(() => {
        wac.validates()
      }).toThrow('invalid WAC: acl:accessTo expected group "myGroup"; found "stanford"')
    })
    it('returns true when this.n3store root container contents pass validation', () => {
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
      wac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
    })
    it('returns true when this.n3store group container contents pass validation', () => {
      const wac = new WebAccessControl('stanford', fs.readFileSync(`${fixture_dir}/stanfordGroupAcl_2Users.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
    })
  })

  describe('asTtl()', () => {
    it('writes console error when this.n3store does not pass validation', () => {
      const spy = jest.spyOn(global.console, 'error')
      const wac = new WebAccessControl('stanford', fs.readFileSync(`${fixture_dir}/noGroupUsers.ttl`).toString())
      wac.asTtl()
      const origMsg = 'invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids'
      const expMsg = `Unable to create WebAccessControl ttl to send to Sinopia server due to ${origMsg}`
      expect(spy).toHaveBeenCalledWith(expMsg)
    })
    it('returns a string containing ttl matching contents of this.n3store', () => {
      const wac = new WebAccessControl('stanford', fs.readFileSync(`${fixture_dir}/stanfordGroupAcl_2Users.ttl`).toString())
      const outputTtlFile = wac.asTtl()
      const myStore = N3.Store()
      myStore.addQuads(N3.Parser().parse(outputTtlFile))

      expect(myStore.countQuads()).toEqual(wac.n3store.countQuads())
      expect(myStore.countQuads()).toBe(9)

      const stanfordGroupNode = namedNode('http://platform:8080/stanford')
      const stanfordEditNode = namedNode('http://platform:8080/#stanford-edit')
      const stanfordReadOnlyNode = namedNode('http://platform:8080/#stanford-read')

      expect(myStore.countQuads(stanfordEditNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(stanfordEditNode, wac.aclModeNode(), wac.aclWriteNode())).toBe(1)
      expect(myStore.countQuads(stanfordEditNode, wac.aclModeNode(), wac.aclControlNode())).toBe(1)
      expect(myStore.countQuads(stanfordEditNode, wac.aclAgentNode(), namedNode('http://sinopia.io/users/cmharlow'))).toBe(1)
      expect(myStore.countQuads(stanfordEditNode, wac.aclAgentNode(), namedNode('http://sinopia.io/users/suntzu'))).toBe(1)
      expect(myStore.countQuads(stanfordEditNode, wac.aclAccessToNode(), stanfordGroupNode)).toBe(1)

      expect(myStore.countQuads(stanfordReadOnlyNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(stanfordReadOnlyNode, wac.aclAgentClassNode(), namedNode('http://xmlns.com/foaf/0.1/Agent'))).toBe(1)
      expect(myStore.countQuads(stanfordReadOnlyNode, wac.aclAccessToNode(), stanfordGroupNode)).toBe(1)
    })
  })
})
