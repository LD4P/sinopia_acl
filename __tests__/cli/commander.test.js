import path from 'path'
import child from 'child_process'
import sinopiaAcl from '../../package'

// Recipe for testing commander adapted from:
//   https://medium.com/@ole.ersoy/unit-testing-commander-scripts-with-jest-bc32465709d6
const cli = (args, cwd) => {
  return new Promise(resolve => {
    // NOTE: this path is relative to your current dir, not relative to this file
    child.exec(`babel-node ${path.resolve('./src/cli/commander')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        })
      })
  })
}

describe('commander', () => {
  test('returns 0 without commands/args', async () => {
    const result = await cli([], '.')
    expect(result.code).toBe(0)
  })
  test('prints version with -v flag', async () => {
    const result = await cli(['-v'], '.')
    expect(result.stdout.trim()).toBe(sinopiaAcl.version)
  })
  test('prints help with -h flag', async () => {
    const expected = /Usage: acl.+options.+command/gi
    const result = await cli(['-h'], '.')
    expect(result.stdout).toMatch(expected)
  })
  describe('users', () => {
    test('prints error and returns 1 without required arg', async () => {
      const result = await cli(['users'], '.')
      expect(result.code).toBe(1)
      expect(result.stderr.trim()).toBe('error: missing required argument `group\'')
    })
    test('returns 0 when command succeeds', async () => {
      const result = await cli(['users', 'group slug here'], '.')
      expect(result.code).toBe(0)
    })
    test.skip('logs error and returns 1 when command throws', async () => {
      // TODO: fix this test: https://github.com/LD4P/sinopia_acl/issues/38
      //
      // The Problem: the CLI instance mocked below is not accessible to us
      //              since it's created in another process in the `const cli`
      //              declaration above, so we can't vary its behavior.
      //
      // import CLI from '../../src/cli/index'
      // jest.mock('../../src/cli/index')
      //
      // let errorSpy = jest.spyOn(console, 'error')
      // let errorMessage = 'it broke'
      // CLI.mockImplementationOnce(() => {
      //   // This mocks the CLI's constructor
      //   return jest.fn().mockImplementationOnce(() => {
      //     return {
      //       listUsers: jest.fn().mockImplementationOnce(() => {
      //         throw errorMessage
      //       })
      //     }
      //   })
      // })
      // const result = await cli(['users', 'group slug here'], '.')
      // expect(result.code).toBe(1)
      // expect(errorSpy).toHaveBeenCalledWith(`Error listing users: ${errorMessage}`)
    })
  })
  describe('groups', () => {
    test('returns 0 when command succeeds', async () => {
      const result = await cli(['groups'], '.')
      expect(result.code).toBe(0)
    })
    test.skip('logs error and returns 1 when command throws', async () => {
      // TODO: fix this test. See related skip above in users() block.
    })
  })
  describe('create', () => {
    test('prints error and returns 1 without required arg', async () => {
      const result = await cli(['create'], '.')
      expect(result.code).toBe(1)
      expect(result.stderr.trim()).toBe('error: missing required argument `group\'')
    })
    test('returns 0 when command succeeds', async () => {
      const result = await cli(['create', 'group slug here'], '.')
      expect(result.code).toBe(0)
    })
    test.skip('logs error and returns 1 when command throws', async () => {
      // TODO: fix this test. See related skip above in users() block.
    })
  })
  describe('add', () => {
    test('returns 0 when command succeeds', async () => {
      const result = await cli(['add foo bar'], '.')
      expect(result.code).toBe(0)
    })
    test('prints error and returns 1 with zero args', async () => {
      const result = await cli(['add'], '.')
      expect(result.code).toBe(1)
      expect(result.stderr.trim()).toBe('error: missing required argument `user\'')
    })
    test('prints error and returns 1 with one arg', async () => {
      const result = await cli(['add', 'userName'], '.')
      expect(result.code).toBe(1)
      expect(result.stderr.trim()).toBe('error: missing required argument `group\'')
    })
    test.skip('logs error and returns 1 when command throws', async () => {
      // TODO: fix this test. See related skip above in users() block.
    })
  })
  describe('remove', () => {
    test('returns 0 when command succeeds', async () => {
      const result = await cli(['remove foo bar'], '.')
      expect(result.code).toBe(0)
    })
    test('prints error and returns 1 with zero args', async () => {
      const result = await cli(['remove'], '.')
      expect(result.code).toBe(1)
      expect(result.stderr.trim()).toBe('error: missing required argument `user\'')
    })
    test('prints error and returns 1 with one arg', async () => {
      const result = await cli(['remove', 'userName'], '.')
      expect(result.code).toBe(1)
      expect(result.stderr.trim()).toBe('error: missing required argument `group\'')
    })
    test.skip('logs error and returns 1 when command throws', async () => {
      // TODO: fix this test. See related skip above in users() block.
    })
  })
})
