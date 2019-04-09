import config from 'config'
import fs from 'fs'
import util from 'util' // for better error message
import NodeFetch from 'node-fetch'
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'

// Need fetch polyfill because amazon-cognito-identity-js uses the Fetch API.
// See: https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js#setup
global.fetch = NodeFetch

export default class AuthenticateClient {
  constructor(username, password) {
    this.username = username
    this.password = password
    // Extracting these to methods makes for easier testing
    this.userPoolId = this.userPoolIdFromConfig()
    this.appClientId = this.appClientIdFromConfig()
    this.cognitoTokenFile = this.cognitoTokenFileFromConfig()

    if (!this.username || !this.password) {
      const errmsg = "ERROR: username and password are required (usually passed at command line)"
      console.error(errmsg)
      throw errmsg
    }

    if (!this.userPoolId || !this.appClientId) {
      const errmsg = "ERROR: userPoolId and userPoolAppClientId are required (usually in config files)"
      console.error(errmsg)
      throw errmsg
    }
  }

  async cognitoTokenToFile() {
    await this.accessTokenPromise()
      .then((jwt) => {
        try {
          fs.writeFileSync(this.cognitoTokenFile, jwt)
        } catch (err) {
          console.error(`problem writing to ${this.cognitoTokenFile}: ${err}`)
        }
      })
      .catch((err) => {
        console.error(`ERROR: problem getting cognito accessToken: ${util.inspect(err)}`)
      })
  }

  /**
   * Return JWT that is a valid cognito accessToken adapted from use case #4
   * here:
   * https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js#usage
   *
   * @private
   */
  accessTokenPromise() {
    return new Promise((resolve, reject) => {
      this.cognitoUser().authenticateUser(this.authenticationDetails(), {
        onSuccess: result => {
          const jwt = result.getAccessToken().getJwtToken()
          if (jwt)
            resolve(jwt)
          else
            reject(`ERROR: retrieved null cognito access token for ${this.username}`)
        },
        onFailure: err => {
          reject(err)
        }
      })
    })
  }

  /**
   * @private
   */
  userPoolIdFromConfig() {
    return config.get('userPoolId')
  }

  /**
   * @private
   */
  appClientIdFromConfig() {
    return config.get('userPoolAppClientId')
  }

  /**
   * @private
   */
  cognitoTokenFileFromConfig() {
    return config.get('cognitoTokenFile')
  }

  /**
   * @private
   */
  authenticationDetails() {
    let authenticationData = {
      Username: this.username,
      Password: this.password
    }
    return new AuthenticationDetails(authenticationData)
  }

  /**
   * @private
   */
  cognitoUser() {
    let poolData = {
      UserPoolId: this.userPoolId,
      ClientId: this.appClientId
    }
    let userPool = new CognitoUserPool(poolData)
    let userData = {
      Username: this.username,
      Pool: userPool
    }
    return new CognitoUser(userData);
  }
}
