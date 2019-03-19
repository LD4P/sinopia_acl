// Simplified model of WebAccessControl (https://www.w3.org/wiki/WebAccessControl)
// At this time:
// - everything in Sinopia Server (Trellis LDP server) is world readable
// - We are only concerned with permissions for "group containers", which are ldp:BasicContaier
// - We expect each group container to have explicit permissions, rather than relying on default permissions of ldp:BaseContainer
// - If a user is given write access for a group, then they get all of acl:Read, acl:Write, and acl:Control
//     "acl": "http://www.w3.org/ns/auth/acl#"

import N3 from 'n3'
const { DataFactory } = N3
// const { namedNode, literal, defaultGraph, quad } = DataFactory
const { namedNode } = DataFactory

export class WebAccessControl {

  constructor(wacData=null) {
    this.n3store = N3.Store()
    this.userNodeArray = []
    if (wacData != null && wacData.length > 5)
      this.parseWac(wacData)
  }

  // expect parseWac to have been called on desired WAC
  listUsers() {
    return this.userNodeArray.map(element => element.value)
  }

  // expect userid to be a string
  // expect parseWac to have been called on desired WAC
  hasUser(userid) {
    return this.listUsers().includes(userid)
  }

  // returns true if triples in this.n3store pass WAC validation
  // throws error otherwise;  expectation is that caller will do something user friendly and useful with the error message
  validates() {
    if (this.n3store.countQuads(null, namedNode('http://www.w3.org/ns/auth/acl#accessTo'), null) == 0)
      throw "invalid WAC: no http://www.w3.org/ns/auth/acl#accessTo predicate"

    if (this.n3store.countQuads(null, namedNode('http://www.w3.org/ns/auth/acl#agentClass'), null) == 0)
      throw "invalid WAC: no http://www.w3.org/ns/auth/acl#agentClass predicate"

    if (this.n3store.countQuads(null, namedNode('http://www.w3.org/ns/auth/acl#mode'), namedNode('http://www.w3.org/ns/auth/acl#Read')) == 0)
      throw "invalid WAC: no http://www.w3.org/ns/auth/acl#Read permissions"

    if (this.isGroupContainer() &&
        this.n3store.countQuads(null, namedNode('http://www.w3.org/ns/auth/acl#agent'), null) == 0)
      throw "invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids"

    return true
  }

  // determine if WebAccessControl is for a group container (not the root container)
  // a group container's URI has a defined, non-null path component that contains more
  //  than just '/', which itself indicates the root container.
  isGroupContainer() {
    const accessToArray = this.n3store.getObjects(null, namedNode('http://www.w3.org/ns/auth/acl#accessTo'), null)
    return accessToArray.every((element) => {
      const path = new URL(element.value).pathname // includes slash prefix
      return (path !== 'undefined' && path != null && path.length > 1)
    })
  }

  // expect wacData to be a string
  parseWac(wacData) {
    const parser = N3.Parser()
    this.n3store = N3.Store()
    if (wacData)
      this.n3store.addQuads(parser.parse(wacData))
    this.userNodeArray = this.n3store.getObjects(null, namedNode('http://www.w3.org/ns/auth/acl#agent'), null)
  }
}
