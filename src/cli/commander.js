import commander from 'commander'
import CLI from './index'
import sinopiaAcl from '../../package'

const cli = new CLI()

commander
  .name('acl')
  .version(sinopiaAcl.version, '-v, --version')

commander
  .command('users <group>')
  .description('List users and access controls in a group')
  .action(group => {
    try {
      cli.listUsers(group)
      process.exit(0)
    } catch(error) {
      console.error(`Error listing users: ${error}`)
      process.exit(1)
    }
  })

commander
  .command('groups')
  .description('List all groups')
  .action(() => {
    try {
      cli.listGroups()
      process.exit(0)
    } catch(error) {
      console.error(`Error listing groups: ${error}`)
      process.exit(1)
    }
  })

commander
  .command('add <user> <group>')
  .description('Add user to group')
  .action((user, group) => {
    try {
      cli.addUserToGroup(user, group)
      process.exit(0)
    } catch(error) {
      console.error(`Error adding user: ${error}`)
      process.exit(1)
    }
  })

commander
  .command('remove <user> <group>')
  .description('Remove user from group')
  .action((user, group) => {
    try {
      cli.removeUserFromGroup(user, group)
      process.exit(0)
    } catch(error) {
      console.error(`Error removing user: ${error}`)
      process.exit(1)
    }
  })

// Parse command-line args and invoke specified command
commander.parse(process.argv)

// Print help because no command above was invoked
commander.help()
