module.exports = {
  adminUsers: // webid list for users that will get acl:Control permissions for all groups
    [
      'http://sinopia.io/users/webid4Admin1',
      'http://sinopia.io/users/webid4Admin2'
    ],
  baseUrl: 'http://localhost:8080',
  // authorization
  userPoolId: 'us-west-2_CGd9Wq136',
  userPoolAppClientId: '2u6s7pqkc1grq1qs464fsi82at',
  cognitoTokenFile: '.cognitoToken'
}
