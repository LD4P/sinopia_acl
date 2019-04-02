import config from 'config'
import fs from 'fs'
import util from 'util' // for better error message
import NodeFetch from 'node-fetch'
global.fetch = NodeFetch
// amazon-cognito-identity-js has no export so we need require
const AmazonCognitoIdentity = require('amazon-cognito-identity-js')

export default class AuthenticateClient {
  constructor() {
    this.userPoolId = config.get('userPoolId')
    this.appClientId = config.get('userPoolAppClientId')
    this.cognitoTokenFile = config.get('cognitoTokenFile')
  }

  async cognitoTokenToFile(username, password) {
    await this.accessTokenPromise(username, password)
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

  // methods below this line can be considered "private"

  // return JWT that is a valid cognito accessToken
  // adapted from use case #4 here: https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js#usage
  accessTokenPromise(username, password) {
    if (!username || !password) {
      const errmsg = "ERROR: username and password are required (usually passed at command line)"
      console.error(errmsg)
      return new Promise((reject) => {reject (errmsg)})
    }
    if (!this.userPoolId || !this.appClientId) {
      const errmsg = "ERROR: userPoolId and userPoolAppClientId are required (usually in config files)"
      console.error(errmsg)
      return new Promise((reject) => {reject (errmsg)})
    }

    let cognitoUser = this.cognitoUser(username, this.userPoolId, this.appClientId)

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(this.authenticationDetails(username, password), {
        onSuccess: result => {
          const jwt = result.getAccessToken().getJwtToken()
          if (jwt)
            resolve(jwt)
          else
            reject(`ERROR: retrieved null cognito access token for ${username}`)
        },
        onFailure: err => {
          reject(err)
        }
      })
    })
  }

  authenticationDetails(username, password) {
    let authenticationData = {
      Username : username,
      Password : password
    }
    return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData)
  }

  cognitoUser(username, userPoolId, appClientId) {
    let poolData = {
      UserPoolId : userPoolId,
      ClientId : appClientId
    }
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)
    let userData = {
      Username : username,
      Pool : userPool
    }
    return new AmazonCognitoIdentity.CognitoUser(userData);
  }

}
