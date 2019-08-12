// This allows parts of the config to refer to others
const defer = require('config/defer').deferConfig

module.exports = {
  baseUrl: process.env.TRELLIS_BASE_URL || 'http://localhost:8080',
  awsRegion: process.env.AWS_REGION || 'us-west-2',
  // usernames from the development Sinopia Cognito user pool (same names used in stage and prod Cogntio pools)
  adminUsers: [
    'sinopia_acl_admin',
    'jgreben',
    'jpnelson',
    'michelle',
    'mjgiarlo',
    'ndushay',
    'suntzu',
    'jcoyne',
    'petucket',
    'jlittman',
    'amcollie'
  ],
  // admin username for getting webids given usernames;  explicit values here are from development Sinopia Cognito user pool
  cognitoAdminUser: process.env.COGNITO_ADMIN_USER || 'sinopia_acl_admin',
  cognitoAdminPassword: process.env.COGNITO_ADMIN_PASSWORD,  // this should NOT have a default value
  awsProfile: process.env.AWS_PROFILE || '',
  userPoolId: process.env.COGNITO_USER_POOL_ID || 'us-west-2_CGd9Wq136',
  userPoolAppClientId: process.env.COGNITO_CLIENT_ID || '2u6s7pqkc1grq1qs464fsi82at',
  cognitoTokenFile: '.cognitoToken',
  cognitoIss: process.env.AWS_COGNITO_ENDPOINT || defer(function () { return `https://cognito-idp.${this.awsRegion}.amazonaws.com/${this.userPoolId}` }), // no trailing slash
  // WARNING: Config.groupsInSinopia in the sinopia_editor codebase *must* be kept in sync with this group list for now
  groups: {
    alberta: 'University of Alberta',
    boulder: 'University of Colorado, Boulder',
    chicago: 'University of Chicago',
    cornell: 'Cornell University',
    dlc: 'Library of Congress',
    duke: 'Duke University',
    frick: 'Frick Art Reference Library',
    harvard: 'Harvard University',
    hrc: 'University of Texas, Austin, Harry Ransom Center',
    ld4p: 'LD4P',
    michigan: 'University of Michigan',
    minnesota: 'University of Minnesota',
    nlm: 'National Library of Medicine',
    northwestern: 'Northwestern University',
    pcc: 'PCC',
    penn: 'University of Pennsylvania',
    princeton: 'Princeton University',
    stanford: 'Stanford University',
    tamu: 'Texas A&M University',
    ucdavis: 'University of California, Davis',
    ucsd: 'University of California, San Diego',
    washington: 'University of Washington',
    yale: 'Yale University'
  }
}
