import superagent from 'superagent'
import N3 from 'n3'
import { WebAccessControl } from '../src/webAccessControl'

const { DataFactory } = N3
const { namedNode } = DataFactory
const rootAclUrl = Boolean(process.env.INSIDE_CONTAINER) ? 'http://platform:8080/?ext=acl' : 'http://localhost:8080/?ext=acl'

describe('WebAccessControl integration', () => {
  test('base container ACLs can be parsed', async  () => {
    const rootAcls = await superagent.get(rootAclUrl).accept('text/turtle')
    const rootNode = namedNode('http://platform:8080/#auth')
    const webAC = new WebAccessControl('', rootAcls.text)

    expect(
      webAC.n3store.countQuads(rootNode, namedNode('http://www.w3.org/ns/auth/acl#accessTo'), namedNode('http://platform:8080/'))
    ).toBe(1)
    expect(
      webAC.n3store.countQuads(rootNode, namedNode('http://www.w3.org/ns/auth/acl#agentClass'), namedNode('http://xmlns.com/foaf/0.1/Agent'))
    ).toBe(1)
    expect(
      webAC.n3store.countQuads(rootNode, namedNode('http://www.w3.org/ns/auth/acl#mode'), null)
    ).toBe(3)
  })
})
