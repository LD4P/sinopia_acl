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
    const basicAuthWac = new WebAccessControl('', fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
    expect(basicAuthWac.hasControlWebId('http://sinopia.io/users/cmharlow')).toBeTruthy()
    expect(myWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
  })

  describe('controlWebIds()', () => {
    it('lists the webids with control access', () => {
      const jwtWac = new WebAccessControl()
      jwtWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control.ttl`).toString())
      expect(jwtWac.controlWebIds().length).toBe(2)
      expect(jwtWac.controlWebIds()).toContain('https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/789dda7d-25c0-4a8f-9c62-b3116a97cc9b')
      expect(jwtWac.controlWebIds()).toContain('https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/56b84999-793f-4fa6-ad20-be8f62a5c2de')
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
      const jwtWac = new WebAccessControl()
      const basicAuthWac = new WebAccessControl()
      beforeAll(() => {
        basicAuthWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
        jwtWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control.ttl`).toString())
      })

      it('true when user has control access', () => {
        expect(jwtWac.hasControlWebId('https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/789dda7d-25c0-4a8f-9c62-b3116a97cc9b')).toBeTruthy()
        expect(basicAuthWac.hasControlWebId('http://sinopia.io/users/cmharlow')).toBeTruthy()
      })
      it('false when user has write, but not control, access', () => {
        expect(jwtWac.hasControlWebId('https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/56b84999-793f-4fa6-ad20-be8f62a5c2de')).toBeFalsy()
      })
      it('false when user does not have control access', () => {
        expect(jwtWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
        expect(basicAuthWac.hasControlWebId('http://example.com/nobody')).toBeFalsy()
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
      const jwtWac = new WebAccessControl()
      beforeAll(() => {
        myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
        jwtWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control1Write.ttl`).toString())
      })

      it('true when user has write (but not control) access', () => {
        expect(jwtWac.hasWriteWebId('http://sinopia.io/users/suntzu')).toBeTruthy()
      })
      it('false when user has control access', () => {
        expect(jwtWac.hasWriteWebId('http://sinopia.io/users/cmharlow')).toBeFalsy()
      })
      it('false when user does not have write access', () => {
        expect(myWac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
        expect(jwtWac.hasWriteWebId('http://example.com/nobody')).toBeFalsy()
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
    it('throws error when there is no acl:accessTo predicate', async () => {
      expect.assertions(1)
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/noAccessToPredicate.ttl`).toString())
      await expect(wac.validates()).rejects.toEqual('invalid WAC: no http://www.w3.org/ns/auth/acl#accessTo predicate')
    })
    it('throws error when there is no acl:agentClass predicate', async () => {
      expect.assertions(1)
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/noAgentClassPredicate.ttl`).toString())
      await expect(wac.validates()).rejects.toEqual('invalid WAC: no http://www.w3.org/ns/auth/acl#agentClass predicate')
    })
    it('throws error when there is no acl:mode acl:Read predicate-object pair', async () => {
      expect.assertions(1)
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/noAclReadIncluded.ttl`).toString())
      await expect(wac.validates()).rejects.toEqual('invalid WAC: no http://www.w3.org/ns/auth/acl#Read permissions')
    })
    it('throws error when a group has no acl:agent predicate', async () => {
      // NOTE: we are no longer doing WAC for group containers
      expect.assertions(1)
      const wac = new WebAccessControl('stanford', fs.readFileSync(`${fixture_dir}/noGroupUsers.ttl`).toString())
      await expect(wac.validates()).rejects.toEqual('invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids')
    })
    it('throws error when group in constructor does not match object of acl:accessTo predicate', async () => {
      // NOTE: we are no longer doing WAC for group containers
      expect.assertions(1)
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/stanfordGroupAcl_2Users.ttl`).toString())
      expect(wac.validates()).rejects.toEqual('invalid WAC: acl:accessTo expected group "myGroup"; found "stanford"')
    })
    it('returns true when this.n3store root container contents pass validation', async () => {
      expect.assertions(1)
      const wac = new WebAccessControl('myGroup', fs.readFileSync(`${fixture_dir}/rootAclValid.ttl`).toString())
      await expect(wac.validates()).resolves.toBeTruthy()
    })
    it('returns true when this.n3store group container contents pass validation', async () => {
      // NOTE: we are no longer doing WAC for group containers
      expect.assertions(1)
      const wac = new WebAccessControl('test', fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control.ttl`).toString())
      await expect(wac.validates()).resolves.toBeTruthy()
    })
  })

  describe('assertAdminControl()', () => {
    it('throws error if non-admin webId has acl:Control permission', async () => {
      expect.assertions(1)
      const myWac = new WebAccessControl()
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/cmharlowBaseAcl.ttl`).toString())
      await expect(myWac.assertAdminControl()).rejects.toEqual('invalid WAC: non-admin webId has control permission: http://sinopia.io/users/cmharlow')
    })
    it('throws error if admin webId does NOT have acl:Control permission', async () => {
      expect.assertions(1)
      const myWac = new WebAccessControl()
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_1Control.ttl`).toString())
      await expect(myWac.assertAdminControl()).rejects.toEqual('invalid WAC: admin does not have control permission: https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/56b84999-793f-4fa6-ad20-be8f62a5c2de')
    })
    it('does not throw error if all admin users, and only admin users have acl:Control', async () => {
      expect.assertions(1)
      const myWac = new WebAccessControl()
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control.ttl`).toString())
      // the following will fail if the promise rejects
      await expect(myWac.assertAdminControl()).resolves.toBeUndefined()
    })
    it('throws error if no control users', async () => {
      expect.assertions(1)
      const myWac = new WebAccessControl()
      myWac.parseWac(fs.readFileSync(`${fixture_dir}/noControl.ttl`).toString())
      await expect(myWac.assertAdminControl()).rejects.toEqual('invalid WAC: no webIds with control permission')
    })
    it('throws error when the wac is an empty string', async () => {
      expect.assertions(1)
      const wac = new WebAccessControl()
      wac.parseWac('')
      await expect(myWac.assertAdminControl()).rejects.toEqual('invalid WAC: no webIds with control permission')
    })
    it('throws error when no wac is parsed', async () => {
      expect.assertions(1)
      const myWac = new WebAccessControl()
      // the following will fail if the promise resolves
      await expect(myWac.assertAdminControl()).rejects.toBeTruthy()
    })
  })

  describe('asTtl()', () => {
    it('writes console error when this.n3store does not pass validation', async () => {
      expect.assertions(1)
      const spy = jest.spyOn(global.console, 'error')
      const wac = new WebAccessControl('stanford', fs.readFileSync(`${fixture_dir}/noGroupUsers.ttl`).toString())
      await wac.asTtl()
      const origMsg = 'invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids'
      const expMsg = `Unable to create WebAccessControl ttl to send to Sinopia server due to ${origMsg}`
      expect(spy).toHaveBeenCalledWith(expMsg)
    })
    it('returns a string containing ttl matching contents of this.n3store', async () => {
      expect.assertions(16)
      const wac = new WebAccessControl('test', fs.readFileSync(`${fixture_dir}/testGroupAcl_2Control.ttl`).toString())
      const outputTtlFile = await wac.asTtl()
      const myStore = new N3.Store()
      const myParser = new N3.Parser()
      const parseOutput = myParser.parse(outputTtlFile)
      myStore.addQuads(parseOutput)

      expect(myStore.countQuads()).toEqual(wac.n3store.countQuads())
      expect(myStore.countQuads()).toBe(13)

      const testGroupNode = namedNode('http://platform:8080/test')
      const controlNode = namedNode('http://platform:8080/#test-control')
      const editNode = namedNode('http://platform:8080/#test-edit')
      const readOnlyNode = namedNode('http://platform:8080/#test-read')

      expect(myStore.countQuads(controlNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclModeNode(), wac.aclWriteNode())).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclModeNode(), wac.aclControlNode())).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclAgentNode(), namedNode('https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/789dda7d-25c0-4a8f-9c62-b3116a97cc9b'))).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclAgentNode(), namedNode('https://cognito-idp.us-west-2.amazonaws.com/us-west-2_CGd9Wq136/56b84999-793f-4fa6-ad20-be8f62a5c2de'))).toBe(1)
      expect(myStore.countQuads(controlNode, wac.aclAccessToNode(), testGroupNode)).toBe(1)

      expect(myStore.countQuads(editNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclModeNode(), wac.aclWriteNode())).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclModeNode(), wac.aclControlNode())).toBe(0)
      expect(myStore.countQuads(editNode, wac.aclAgentClassNode(), namedNode('http://www.w3.org/ns/auth/acl#AuthenticatedAgent'))).toBe(1)
      expect(myStore.countQuads(editNode, wac.aclAccessToNode(), testGroupNode)).toBe(1)

      expect(myStore.countQuads(readOnlyNode, wac.aclModeNode(), wac.aclReadNode())).toBe(1)
      expect(myStore.countQuads(readOnlyNode, wac.aclAgentClassNode(), namedNode('http://xmlns.com/foaf/0.1/Agent'))).toBe(1)
      expect(myStore.countQuads(readOnlyNode, wac.aclAccessToNode(), testGroupNode)).toBe(1)
    })
  })
})
