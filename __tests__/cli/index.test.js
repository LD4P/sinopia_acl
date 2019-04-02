import CLI from '../../src/cli/index'

describe('CLI', () => {
  const cli = new CLI()
  const consoleSpy = jest.spyOn(console, 'log')

  test('listGroups()', () => {
    cli.listGroups()
    expect(consoleSpy).toHaveBeenCalledWith('not implemented yet')
  })
  test('listUsers()', () => {
    const group = 'foobar'
    cli.listUsers(group)
    expect(consoleSpy).toHaveBeenCalledWith(`not implemented yet. args: ${group}`)
  })
  test('createGroup()', () => {
    const cliSpy = jest.spyOn(cli, 'createGroup')
    const group = 'testingGroup'
    cli.createGroup(group)
    expect(consoleSpy).not.toHaveBeenCalled()
    expect(cliSpy).toHaveBeenCalledWith(group)
  })
  test('addUserToGroup()', () => {
    const user = 'http://sinopia.io/users/mjgiarlo'
    const group = 'stanford'
    cli.addUserToGroup(user, group)
    expect(consoleSpy).toHaveBeenCalledWith(`not implemented yet. args: ${user}, ${group}`)
  })
  test('removeUserFromGroup()', () => {
    const user = 'http://sinopia.io/users/mjgiarlo'
    const group = 'stanford'
    cli.removeUserFromGroup(user, group)
    expect(consoleSpy).toHaveBeenCalledWith(`not implemented yet. args: ${user}, ${group}`)
  })
})
