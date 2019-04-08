import config from 'config'
import AuthenticateClient from '../src/authenticateClient'
import fs from 'fs'

describe('AuthenticateClient', () => {
  const client = new AuthenticateClient()

  let username = config.get('testUser')
  let password = process.env.AUTH_TEST_PASS

  describe('cognitoTokenToFile()', () => {
    test('creates cognitoTokenFile with JWT if it does not exist', async () => {
      if (fs.existsSync(client.cognitoTokenFile))
        fs.unlinkSync(client.cognitoTokenFile)
      expect(fs.existsSync(client.cognitoTokenFile)).toBeFalsy()
      await client.cognitoTokenToFile(username, password)
      expect(fs.existsSync(client.cognitoTokenFile)).toBeTruthy()
    })

    test.skip('updates cognitoTokenFile with new JWT if it already exists with diff value', async () => {
    })

    test.skip('updates cognitoTokenFile even if it already has the value', async () => {
      // check timestamp of file?
    })

    test('useful message to console error if no jwt is returned', async () => {
      const beginExpMsg = "ERROR: problem getting cognito accessToken: { code: 'UserNotFoundException',"
      const endExpMsg = "message: 'User does not exist.' }"
      const spy = jest.spyOn(global.console, 'error')
      await client.cognitoTokenToFile('nobody', 'badpassword')
      expect(spy).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(beginExpMsg)))
      expect(spy).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(endExpMsg)))
    })

    test.skip('does not touch cognitoTokenFile if no jwt is returned', async () => {
    })

    test.skip('useful error message to console error if cannot write cognitoToenFile', async () => {
    })
  })

  describe('accessTokenPromise()', () => {
    test('gets accessToken ', () => {
      expect(username).toBeTruthy()
      expect(password).toBeTruthy()
      return client.accessTokenPromise(username, password)
        .then((jwt) => {
          expect(jwt).toBeTruthy()
          expect(jwt.length).toBeGreaterThan(300)
        })
        .catch((err) => {
          console.error(`problem getting accessToken in beforeEach: ${err}`)
          expect(err).toBeFalsy()
        })
    }, 10000)

    test.skip('error if no jwt is returned', async () => {
    })

    test('logs error if no username is provided', () => {
      const errmsg = 'ERROR: username and password are required (usually passed at command line)'
      const spy = jest.spyOn(global.console, 'error')
      client.accessTokenPromise(null, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.accessTokenPromise(undefined, password)
      expect(spy).toHaveBeenNthCalledWith(2, errmsg)
      client.accessTokenPromise('', password)
      expect(spy).toHaveBeenNthCalledWith(3, errmsg)
    })

    test('logs error if no password is provided', () => {
      const errmsg = 'ERROR: username and password are required (usually passed at command line)'
      const spy = jest.spyOn(global.console, 'error')
      client.accessTokenPromise(username, null)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.accessTokenPromise(username, undefined)
      expect(spy).toHaveBeenNthCalledWith(2, errmsg)
      client.accessTokenPromise(username, '')
      expect(spy).toHaveBeenNthCalledWith(3, errmsg)
    })

    test('logs error if no userPoolId is provided', () => {
      const errmsg = 'ERROR: userPoolId and userPoolAppClientId are required (usually in config files)'
      const spy = jest.spyOn(global.console, 'error')
      const prevPoolId = client.userPooldId
      client.userPoolId = null
      client.accessTokenPromise(username, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.userPoolId = undefined
      client.accessTokenPromise(username, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.userPoolId = ''
      client.accessTokenPromise(username, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.userPoolId = prevPoolId
    })

    test('logs error if no appClientId is provided', () => {
      const errmsg = 'ERROR: userPoolId and userPoolAppClientId are required (usually in config files)'
      const spy = jest.spyOn(global.console, 'error')
      const prevAppClientId = client.appClientId
      client.appClientId = null
      client.accessTokenPromise(username, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.appClientId = undefined
      client.accessTokenPromise(username, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.appClientId = ''
      client.accessTokenPromise(username, password)
      expect(spy).toHaveBeenNthCalledWith(1, errmsg)
      client.appClientId = prevAppClientId
    })
  })

})
