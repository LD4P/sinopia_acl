// Simplified model of WebAccessControl (https://www.w3.org/wiki/WebAccessControl)
// At this time:
// - everything in Sinopia Server (Trellis LDP server) is world readable
// - We are only concerned with permissions for "group containers", which are ldp:BasicContaier
// - We expect each group container to have explicit permissions, rather than relying on default permissions of ldp:BaseContainer
// - If a user is given write access for a group, then they get all of acl:Read, acl:Write, and acl:Control
//     "acl": "http://www.w3.org/ns/auth/acl#"

import N3 from 'n3'
const { DataFactory } = N3
const { namedNode } = DataFactory
const aclModeNode = namedNode('http://www.w3.org/ns/auth/acl#mode')
const aclControlNode = namedNode('http://www.w3.org/ns/auth/acl#Control')
const aclReadNode = namedNode('http://www.w3.org/ns/auth/acl#Read')
const aclWriteNode = namedNode('http://www.w3.org/ns/auth/acl#Write')
const aclAgentNode = namedNode('http://www.w3.org/ns/auth/acl#agent')
const aclAccessToNode = namedNode('http://www.w3.org/ns/auth/acl#accessTo')
const aclAgentClassNode = namedNode('http://www.w3.org/ns/auth/acl#agentClass')

export class WebAccessControl {

  constructor(groupName='', wacData=null) {
    this.groupName = groupName
    this.n3store = N3.Store() // the object containing the graph
    this.userNodeArray = []
    if (wacData != null && wacData.length > 5)
      this.parseWac(wacData)
  }

  aclModeNode() { return aclModeNode }
  aclControlNode() { return aclControlNode }
  aclReadNode() { return aclReadNode }
  aclWriteNode() { return aclWriteNode }
  aclAgentNode() { return aclAgentNode }
  aclAccessToNode() { return aclAccessToNode }
  aclAgentClassNode() { return aclAgentClassNode }

  // expect parseWac to have been called on desired WAC
  listUsers() {
    return this.userNodeArray.map(element => element.value)
  }

  // expect userid to be a string
  // expect parseWac to have been called on desired WAC
  hasUser(userid) {
    return this.listUsers().includes(userid)
  }

  // returns true if triples in graph pass WAC validation
  // throws error otherwise;  expectation is that caller will do something user friendly and useful with the error message
  validates() {
    if (this.n3store.countQuads(null, this.aclAccessToNode(), null) == 0)
      throw "invalid WAC: no http://www.w3.org/ns/auth/acl#accessTo predicate"

    if (this.n3store.countQuads(null, this.aclAgentClassNode(), null) == 0)
      throw "invalid WAC: no http://www.w3.org/ns/auth/acl#agentClass predicate"

    if (this.n3store.countQuads(null, this.aclModeNode(), this.aclReadNode()) == 0)
      throw "invalid WAC: no http://www.w3.org/ns/auth/acl#Read permissions"

    if (this.isMyGroupContainer() &&
        this.n3store.countQuads(null, this.aclAgentNode(), null) == 0)
      throw "invalid WAC: group container requires http://www.w3.org/ns/auth/acl#agent webids"

    return true
  }

  // determine if WebACL is for this.groupName container (not the root container, not a diff group container)
  //   Note: a group container's URI has a defined, non-null path component that contains more
  //     than just '/', which itself indicates the root container.
  // returns true if WebACL is for this.groupName container
  // returns false if WebACL is for the root container
  // throws error if expected group is not this.groupName
  isMyGroupContainer() {
    const accessToArray = this.n3store.getObjects(null, this.aclAccessToNode())
    return accessToArray.every((element) => {
      const path = new URL(element.value).pathname // includes slash prefix
      if (path == 'undefined' || path == null || path.length < 2)
        return false
      else if (new RegExp(`^/${this.groupName}$`).test(path))
        return true
      else
        throw `invalid WAC: acl:accessTo expected group "${this.groupName}"; found "${path.substr(1)}"`
    })
  }

  // returns a string containing ttl format serialized RDF from graph store
  asTtl() {
    try {
      if (this.validates()) {
        return N3.Writer().quadsToString(this.n3store.getQuads())
      }
    }
    catch(err) {
      console.error(`Unable to create WebAccessControl ttl to send to Sinopia server due to ${err}`)
    }
  }

  // expect wacData to be a string
  parseWac(wacData) {
    const parser = N3.Parser()
    this.n3store = N3.Store()
    if (wacData)
      this.n3store.addQuads(parser.parse(wacData))
    this.userNodeArray = this.n3store.getObjects(null, this.aclAgentNode(), null)
  }
}
