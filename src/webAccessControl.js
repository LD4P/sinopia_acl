// Simplified model of WebAccessControl (https://www.w3.org/wiki/WebAccessControl)
// At this time:
// - everything in Sinopia Server (Trellis LDP server) is world readable
// - We are only concerned with permissions for "group containers", which are ldp:BasicContaier
// - We expect each group container to have explicit permissions, rather than relying on default permissions of ldp:BaseContainer
// - If a user is given write access for a group, then they get all of acl:Read, acl:Write, and acl:Control
//     "acl": "http://www.w3.org/ns/auth/acl#"

import config from 'config'
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
  //  this returns webids for users with control permissions (ususally implies write and read also in practice)
  controlWebIds() {
    return this.webidsWithControl
  }

  // expect webid to be a string
  // expect parseWac to have been called on desired WAC
  hasControlWebId(webid) {
    if (this.controlWebIds() === undefined)
      return false
    return this.controlWebIds().includes(webid)
  }

  // expect parseWac to have been called on desired WAC
  //  this returns webids for users with write (and read) permissions but not control
  writeWebIds() {
    return this.webidsWithWrite
  }

  // expect webid to be a string
  // expect parseWac to have been called on desired WAC
  hasWriteWebId(webid) {
    if (this.writeWebIds() === undefined)
      return false
    return this.writeWebIds().includes(webid)
  }

  // expect parseWac to have been called on desired WAC
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

    this.assertAdminControl()

    return true
  }

  // expect parseWac to have been called on desired WAC
  // throws an error if:
  //   - there is no subject node with acl:Control
  //   - non-admin user has acl:Control permissions
  //   - any admin users from config file do NOT have acl:Control permissions
  assertAdminControl() {
    if (this.controlWebIds().length == 0)
      throw "invalid WAC: no webIds with control permission"

    const adminUsers = config.get('adminUsers')
    this.controlWebIds().every(controlWebId => {
      if (!adminUsers.includes(controlWebId))
        throw `invalid WAC: non-admin webId has control permission: ${controlWebId}`
    })

    // we need to do more checking if there are more adminUsers than controlWebIds
    if (adminUsers.length > this.controlWebIds().length) {
      adminUsers.forEach(webId => {
        if (!this.controlWebIds().includes(webId))
          throw `invalid WAC: admin does not have control permission: ${webId}`
      })
    }
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
      if (path === undefined || path == null || path.length < 2)
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
    this.webidsWithControl = []
    this.webidsWithWrite = []
    if (wacData) {
      this.n3store.addQuads(parser.parse(wacData))
      // control access
      this.n3store.getSubjects(this.aclModeNode(), this.aclControlNode()).forEach(subjectNode => {
        const userNodes = this.n3store.getObjects(subjectNode, this.aclAgentNode())
        userNodes.forEach(userNode => {
          const webId = userNode.value
          if (!this.webidsWithControl.includes(webId))
            this.webidsWithControl.push(webId)
        })
      })
      // write but no control
      this.n3store.getSubjects(this.aclModeNode(), this.aclWriteNode()).forEach(subjectNode => {
        var userNodes = this.n3store.getObjects(subjectNode, this.aclAgentNode())
        userNodes.forEach(userNode => {
          var webId = userNode.value
          if (!this.webidsWithWrite.includes(webId) && !this.webidsWithControl.includes(webId))
            this.webidsWithWrite.push(webId)
        })
      })
    }
  }
}
