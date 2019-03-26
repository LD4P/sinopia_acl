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
    expect(wac.hasControlWebId('http://sinopia.io/users/cmharlow')).toBeTruthy()
    expect(myWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
  })

  describe('controlWebIds()', () => {
    it('lists the webids with control access', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control1Write.ttl`).toString())
      expect(myWac.controlWebIds()).toEqual(['http://sinopia.io/users/cmharlow'])

      myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      expect(myWac.controlWebIds()).toEqual(['http://sinopia.io/users/cmharlow'])
    })

    it('empty array when the wac has no control access (does not error)', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/noControl.ttl`).toString())
      expect(myWac.controlWebIds()).toEqual([])
    })
    it('empty array when the wac has no control permissions (does not error)', () => {
      const wac = new WebAccessControl()
      wac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(wac.controlWebIds()).toEqual([])
    })
    it('empty array when the wac is an empty string', () => {
      const wac = new WebAccessControl()
      wac.parseWac('')
      expect(wac.controlWebIds()).toEqual([])
    })
    it('undefined when no wac is parsed', () => {
      const wac = new WebAccessControl()
      expect(wac.controlWebIds()).toBe(undefined)
    })
  })

  describe('writeWebIds()', () => {
    it('lists the webids with write, but not control, access', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control1Write.ttl`).toString())
      expect(myWac.writeWebIds()).toEqual(['http://sinopia.io/users/suntzu'])
    })

    it('empty array when the wac has no write users (does not error)', () => {
      const wac = new WebAccessControl()
      wac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(wac.writeWebIds()).toEqual([])
    })
    it('empty array when the wac is an empty string', () => {
      const wac = new WebAccessControl()
      wac.parseWac('')
      expect(wac.writeWebIds()).toEqual([])
    })
    it('undefined when no wac is parsed', () => {
      const wac = new WebAccessControl()
      expect(wac.writeWebIds()).toBe(undefined)
    })
  })

  describe('hasControlWebId()', () => {
    describe('ttl fixture', () => {
      const otherWac = new WebAccessControl()
      beforeAll(() => {
        myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
        otherWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control1Write.ttl`).toString())
      })

      it('true when user has control access', () => {
        expect(myWac.hasControlWebId('http://sinopia.io/users/cmharlow')).toBeTruthy()
        expect(otherWac.hasControlWebId('http://sinopia.io/users/cmharlow')).toBeTruthy()
      })
      it('false when user has write, but not control, access', () => {
        expect(otherWac.hasControlWebId('http://sinopia.io/users/suntzu')).toBeFalsy()
      })
      it('false when user does not have control access', () => {
        expect(myWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
        expect(otherWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
      })
    })

    it('false when the wac has no users (does not error)', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(myWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
    })
    it('false when the wac is an empty string', () => {
      myWac.parseWac('')
      expect(myWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
    })
    it('false when no wac is parsed', () => {
      const wac = new WebAccessControl()
      expect(wac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
    })
  })

  describe('hasWriteWebId()', () => {
    describe('ttl fixture', () => {
      const otherWac = new WebAccessControl()
      beforeAll(() => {
        myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
        otherWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control1Write.ttl`).toString())
      })

      it('true when user has write (but not control) access', () => {
        expect(otherWac.hasWriteWebId('http://sinopia.io/users/suntzu')).toBeTruthy()
      })
      it('false when user has control access', () => {
        expect(otherWac.hasWriteWebId('http://sinopia.io/users/cmharlow')).toBeFalsy()
      })
      it('false when user does not have write access', () => {
        expect(otherWac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
        expect(myWac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
      })
    })

    it('false when the wac has no users (does not error)', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/defaultBaseAcl.ttl`).toString())
      expect(myWac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
    })
    it('false when the wac is an empty string', () => {
      myWac.parseWac('')
      expect(myWac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
    })
    it('false when no wac is parsed', () => {
      const wac = new WebAccessControl()
      expect(wac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
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
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/rootAclValid.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
    })
    it('returns true when this.n3store group container contents pass validation', () => {
      const wac = new WebAccessControl('test', fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control2Write.ttl`).toString())
      expect(wac.validates()).toBeTruthy()
    })
  })

  describe('assertAdminControl()', () => {
    it('throws error if non-admin webId has acl:Control permission', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      expect(() => {
        myWac.assertAdminControl()
      }).toThrow('invalid WAC: non-admin webId has control permission: http://sinopia.io/users/cmharlow')
    })
    it('throws error if admin webId does NOT have acl:Control permission', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control2Write.ttl`).toString())
      expect(() => {
        myWac.assertAdminControl()
      }).toThrow('invalid WAC: admin does not have control permission: ')
    })
    it('does not throw error if all admin users, and only admin users have acl:Control', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control2Write.ttl`).toString())
      expect(() => {
        myWac.assertAdminControl()
      }).not.toThrow()
    })
    it('throws error if no control users', () => {
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/noControl.ttl`).toString())
      expect(() => {
        myWac.assertAdminControl()
      }).toThrow('invalid WAC: no webIds with control permission')
    })
    it('throws error when the wac is an empty string', () => {
      const wac = new WebAccessControl()
      wac.parseWac('')
      expect(() => {
        myWac.assertAdminControl()
      }).toThrow('invalid WAC: no webIds with control permission')
    })
    it('throws error when no wac is parsed', () => {
      expect(() => {
        myWac.assertAdminControl()
      }).toThrow('invalid WAC: no webIds with control permission')
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
      const wac = new WebAccessControl('test', fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control2Write.ttl`).toString())
      const outputTtlFile = wac.asTtl()
      const myStore = N3.Store()
      myStore.addQuads(N3.Parser().parse(outputTtlFile))

      expect(myStore.countQuads()).toEqual(wac.n3store.countQuads())
      expect(myStore.countQuads()).toBe(14)

      const testGroupNode = namedNode('http://platform:8080/test')
      const controlNode = namedNode('http://platform:8080/#test-control')
      const editNode = namedNode('http://platform:8080/#test-edit')
      const readOnlyNode = namedNode('http://platform:8080/#test-read')

      expect(myStore.countQuads(controlNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclModeNode(), wac.aclWriteNode())).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclModeNode(), wac.aclControlNode())).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclAgentNode(), namedNode('http://sinopia.io/users/webid4Admin1'))).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclAgentNode(), namedNode('http://sinopia.io/users/webid4Admin2'))).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclAccessToNode(), testGroupNode)).toBe(1)

      expect(myStore.countQuads(editNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclModeNode(), wac.aclWriteNode())).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclModeNode(), wac.aclControlNode())).toBe(0)
      expect(myStore.countQuads(editNode, wac.aclAgentNode(), namedNode('http://sinopia.io/users/cmharlow'))).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclAgentNode(), namedNode('http://sinopia.io/users/suntzu'))).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclAccessToNode(), testGroupNode)).toBe(1)

      expect(myStore.countQuads(readOnlyNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(readOnlyNode, wac.aclAgentClassNode(), namedNode('http://xmlns.com/foaf/0.1/Agent'))).toBe(1)
      expect(myStore.countQuads(readOnlyNode, wac.aclAccessToNode(), testGroupNode)).toBe(1)
    })
  })
})
