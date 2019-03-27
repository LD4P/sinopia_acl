import SinopiaClient from '../sinopiaClient'

export default class CLI {
  constructor() {
    this.client = new SinopiaClient()
  }

  createGroup(groupSlug) {
    return this.client.createGroup(groupSlug)
  }

  listGroups() {
    // TODO: use Sinopia client to get list of groups
    // import SinopiaServer from 'sinopia_server'
    // const client = new SinopiaServer.LDPApi()
    // NOTE: this does not appear to be defined in the swagger spec
    // return client.listGroups()
    console.log('not implemented yet')
  }

  listUsers(groupSlug) {
    // TODO: get WebAccessControl instance with specified group slug
    // const acl = new WebAccessControl(groupSlug)
    // return acl.listUsers()
    console.log(`not implemented yet. args: ${groupSlug}`)
  }

  addUserToGroup(userUri, groupSlug) {
    // TODO: use Sinopia client to add user to group
    // import SinopiaServer from 'sinopia_server'
    // const client = new SinopiaServer.LDPApi()
    // NOTE: this does not appear to be defined in the swagger spec
    // return client.addUserToGroup(userUri, groupSlug)
    console.log(`not implemented yet. args: ${userUri}, ${groupSlug}`)
  }

  removeUserFromGroup(userUri, groupSlug) {
    // TODO: use Sinopia client to remove user from group
    // import SinopiaServer from 'sinopia_server'
    // const client = new SinopiaServer.LDPApi()
    // NOTE: this does not appear to be defined in the swagger spec
    // return client.removeUserFromGroup(userUri, groupSlug)
    console.log(`not implemented yet. args: ${userUri}, ${groupSlug}`)
  }
}
