import CLI from '../../src/cli/index'

describe('CLI', () => {
  const cli = new CLI()
  const consoleSpy = jest.spyOn(console, 'log')

  test('listGroups()', () => {
    cli.listGroups()
    expect(consoleSpy).toHaveBeenCalledWith('not implemented yet')
  })
  test('listUsers()', () => {
    const group = 'http://localhost/foo'
    cli.listUsers(group)
    expect(consoleSpy).toHaveBeenCalledWith(`not implemented yet. args: ${group}`)
  })
  test('addUserToGroup()', () => {
    const user = 'http://sinopia.io/users/mjgiarlo'
    const group = 'http://localhost:8080/stanford'
    cli.addUserToGroup(user, group)
    expect(consoleSpy).toHaveBeenCalledWith(`not implemented yet. args: ${user}, ${group}`)
  })
  test('removeUserFromGroup()', () => {
    const user = 'http://sinopia.io/users/mjgiarlo'
    const group = 'http://localhost:8080/stanford'
    cli.removeUserFromGroup(user, group)
    expect(consoleSpy).toHaveBeenCalledWith(`not implemented yet. args: ${user}, ${group}`)
  })
})
