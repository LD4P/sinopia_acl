import config from 'config'
import AuthenticateClient from '../src/authenticateClient'
import fs from 'fs'

describe('AuthenticateClient', () => {
  const username = config.get('testUser')
  const password = config.get('cognitoAdminPassword')

  describe('constructor()', () => {
    describe('username and password validation', () => {
      const errmsg = 'ERROR: username and password are required (usually passed at command line)'
      const spy = jest.spyOn(global.console, 'error')

      test('logs error and throws if username is null', () => {
        expect(() => {
          new AuthenticateClient(null, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if username is undefined', () => {
        expect(() => {
          new AuthenticateClient(undefined, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if username is empty string', () => {
        expect(() => {
          new AuthenticateClient('', password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if password is null', () => {
        expect(() => {
          new AuthenticateClient(username, null)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if password is undefined', () => {
        expect(() => {
          new AuthenticateClient(username, undefined)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if password is empty string', () => {
        expect(() => {
          new AuthenticateClient(username, '')
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })
    })
    describe('userPoolId and appClientId validation', () => {
      const errmsg = 'ERROR: userPoolId and userPoolAppClientId are required (usually in config files)'
      const spy = jest.spyOn(global.console, 'error')

      test('logs error and throws if userPoolId is null', () => {
        AuthenticateClient.prototype.userPoolIdFromConfig = jest.fn().mockImplementation(() => {
          return null
        })
        expect(() => {
          new AuthenticateClient(username, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if userPoolId is undefined', () => {
        AuthenticateClient.prototype.userPoolIdFromConfig = jest.fn().mockImplementation(() => {
          return undefined
        })
        expect(() => {
          new AuthenticateClient(username, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if userPoolId is empty string', () => {
        AuthenticateClient.prototype.userPoolIdFromConfig = jest.fn().mockImplementation(() => {
          return ''
        })
        expect(() => {
          new AuthenticateClient(username, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if appClientId is null', () => {
        AuthenticateClient.prototype.appClientIdFromConfig = jest.fn().mockImplementation(() => {
          return null
        })
        expect(() => {
          new AuthenticateClient(username, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if appClientId is undefined', () => {
        AuthenticateClient.prototype.appClientIdFromConfig = jest.fn().mockImplementation(() => {
          return undefined
        })
        expect(() => {
          new AuthenticateClient(username, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })

      test('logs error and throws if appClientId is empty string', () => {
        AuthenticateClient.prototype.appClientIdFromConfig = jest.fn().mockImplementation(() => {
          return ''
        })
        expect(() => {
          new AuthenticateClient(username, password)
        }).toThrow(errmsg)
        expect(spy).toHaveBeenCalledWith(errmsg)
      })
    })
  })

  describe('cognitoTokenToFile()', () => {
    const client = new AuthenticateClient(username, password)

    test('creates cognitoTokenFile with JWT if it does not exist', async () => {
      if (fs.existsSync(client.cognitoTokenFile))
        fs.unlinkSync(client.cognitoTokenFile)
      expect(fs.existsSync(client.cognitoTokenFile)).toBeFalsy()
      await client.cognitoTokenToFile()
      expect(fs.existsSync(client.cognitoTokenFile)).toBeTruthy()
    }, 10000)

    test.skip('updates cognitoTokenFile with new JWT if it already exists with diff value', () => {
    })

    test.skip('updates cognitoTokenFile even if it already has the value', () => {
      // check timestamp of file?
    })

    test('useful message to console error if no jwt is returned', async () => {
      const beginExpMsg = "ERROR: problem getting cognito accessToken: { code: 'UserNotFoundException',"
      const endExpMsg = "message: 'User does not exist.' }"
      const spy = jest.spyOn(global.console, 'error')
      client.username = 'nobody'
      client.password = 'badpassword'
      await client.cognitoTokenToFile()
      expect(spy).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(beginExpMsg)))
      expect(spy).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(endExpMsg)))
    })

    test.skip('does not touch cognitoTokenFile if no jwt is returned', () => {
    })

    test.skip('useful error message to console if cannot write cognitoTokenFile', () => {
    })

    describe('accessTokenPromise()', () => {
      const client = new AuthenticateClient(username, password)

      test('gets accessToken', async () => {
        return client.accessTokenPromise()
          .then((jwt) => {
            expect(jwt).toBeTruthy()
            expect(jwt.length).toBeGreaterThan(300)
          })
          .catch((err) => {
            console.error(`problem getting accessToken in beforeEach: ${err}`)
            console.dir(err)
            console.log(client.username)
            expect(err).toBeFalsy()
          })
      }, 10000)

      test.skip('error if no jwt is returned', () => {
      })
    })
  })

  describe('webId()', () => {
    const client = new AuthenticateClient(username, password)
    const desiredUser = username

    test('returns valid webId', async () => {
      const webid = await client.webId(desiredUser)
      const startsWithRegex = new RegExp(`^https://${client.cognitoDomain}/${client.userPoolId}/`)
      expect(webid).toMatch(startsWithRegex)
      const endsWithUuidRegex = new RegExp("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
      expect(webid).toMatch(endsWithUuidRegex)
    }, 10000)

    test.skip('throws error and console logs if problem', async() => {
    })
  })

})
