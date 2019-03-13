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

  constructor(wacData) {
    this.n3store = N3.Store()
    if (wacData != null && wacData.length > 5)
      parseWac(wacData)
  }

  // listUsers() {
  //
  // }

  // expect userid to be a string
  hasUser(userid) {
    // TODO: memoize userNodeArray for instance?
    const userNodeArray = this.n3store.getObjects(null, namedNode('http://www.w3.org/ns/auth/acl#agent'), null)
    if (userNodeArray == undefined || userNodeArray.size == 0)
      return false

    var matchingNode = userNodeArray.find((element) => {
      return element.value === userid
    })
    if (matchingNode)
      return true
    else
      return false
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
  }
}
