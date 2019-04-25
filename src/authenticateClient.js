import config from 'config'
import fs from 'fs'
import util from 'util' // for better error message
import NodeFetch from 'node-fetch'
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'
import { SharedIniFileCredentials, CognitoIdentityServiceProvider, Config }  from 'aws-sdk'

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
    this.cognitoTokenFile = config.get('cognitoTokenFile')
    this.cognitoDomain = config.get('cognitoDomain')
    this.awsRegion = config.get('awsRegion')

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
   * return the webid for the cognito username in the pool
   *
   * throws an error (and console error) if there is an error getting the webid
   */
  async webId(cognitoUserName) {
    try {
      const userSub = await this.userSubFromCognitoPool(cognitoUserName)
      return `https://${this.cognitoDomain}/${this.userPoolId}/${userSub}`
    } catch(err) {
      const errmsg = `ERROR: problem getting webid for ${cognitoUserName}: ${util.inspect(err)}`
      console.error(errmsg)
      throw errmsg
    }
  }

  /**
   * return the uuid that is the value of the AWS 'sub' UserAttribute for the cognito username in the pool
   *
   * throws an error if there is a problem getting the 'sub'
   * @private
   */
  async userSubFromCognitoPool(cognitoUserName) {
    const awsProfile = config.get('awsProfile')
    if (awsProfile) {
      process.env.AWS_SDK_LOAD_CONFIG = true // loads credential info from .aws/config as well as .aws/credentials
      const credentials = new SharedIniFileCredentials({profile: awsProfile})
      Config.credentials = credentials
    }
    // else env vars AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY are sufficient (e.g. circleci, AWS containers)

    const cognito = new CognitoIdentityServiceProvider({
      apiVersion: '2016-04-18',  // this value pertains something inside the AWS SDK npm package itself
      region: this.awsRegion
    })

    const desiredUserParams = {
      UserPoolId: this.userPoolId,
      Username: cognitoUserName
    }

    return await cognito.adminGetUser(desiredUserParams).promise().then((data, err) => {
      const sub = this.userSubFromUserData(data, err)
      return sub
    })
  }

  /**
   * given user data object returned from adminGetUser call, return the uuid from the 'sub' attribute
   #  throws an error if err is truthy (non-null, etc).
   * @private
   */
  userSubFromUserData(userData, err) {
    if (err) {
      const errmsg = `ERROR: problem retrieving sub user attribute: ${util.inspect(err)}`
      console.error(errmsg)
      throw errmsg
    }
    const subAttribute = userData["UserAttributes"].find((element) => {
      // each element is an object:
      // { Name: 'sub', Value: '789dda7d-25c0-4a8f-9c62-b3116a97cc9b' }
      return element["Name"] == 'sub'
    })
    return subAttribute["Value"]
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
