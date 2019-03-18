// Simplified model of WebAccessControl (https://www.w3.org/wiki/WebAccessControl)
// At this time:
// - everything in Sinopia Server (Trellis LDP server) is world readable
// - We are only concerned with permissions for "group containers", which are ldp:BasicContaier
// - We expect each group container to have explicit permissions, rather than relying on default permissions of ldp:BaseContainer
// - If a user is given write access for a group, then they get all of acl:Read, acl:Write, and acl:Control
//     "acl": "http://www.w3.org/ns/auth/acl#"

const N3 = require('n3')
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

  // userCanWrite(userid) {
  //
  // }

  // expect wacData to be a string
  parseWac(wacData) {
    const parser = N3.Parser()
    this.n3store = N3.Store()
    if (wacData)
      this.n3store.addQuads(parser.parse(wacData))
    this.userNodeArray = this.n3store.getObjects(null, namedNode('http://www.w3.org/ns/auth/acl#agent'), null)
  }

}
