export default class CLI {
  listGroups() {
    // TODO: use Sinopia client to get list of groups
    // import SinopiaServer from 'sinopia_server'
    // const client = new SinopiaServer.LDPApi()
    // NOTE: this does not appear to be defined in the swagger spec
    // return client.listGroups()
    console.log('not implemented yet')
  }

  listUsers(groupUri) {
    // TODO: get WebAccessControl instance with specified group URI
    // const acl = new WebAccessControl(groupUri)
    // return acl.listUsers()
    console.log(`not implemented yet. args: ${groupUri}`)
  }

  addUserToGroup(userUri, groupUri) {
    // TODO: use Sinopia client to add user to group
    // import SinopiaServer from 'sinopia_server'
    // const client = new SinopiaServer.LDPApi()
    // NOTE: this does not appear to be defined in the swagger spec
    // return client.addUserToGroup(userUri, groupUri)
    console.log(`not implemented yet. args: ${userUri}, ${groupUri}`)
  }

  removeUserFromGroup(userUri, groupUri) {
    // TODO: use Sinopia client to remove user from group
    // import SinopiaServer from 'sinopia_server'
    // const client = new SinopiaServer.LDPApi()
    // NOTE: this does not appear to be defined in the swagger spec
    // return client.removeUserFromGroup(userUri, groupUri)
    console.log(`not implemented yet. args: ${userUri}, ${groupUri}`)
  }
}
