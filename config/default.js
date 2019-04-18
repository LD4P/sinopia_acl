// This allows parts of the config to refer to others
const defer = require('config/defer').deferConfig

module.exports = {
  baseUrl: 'http://localhost:8080',
  // usernames from the development Sinopia Cognito user pool (same names used in stage and prod Cogntio pools)
  adminUsers: [
    'jgreben',
    'jpnelson',
    'michelle',
    'mjgiarlo',
    'ndushay',
    'suntzu'
  ],
  userPoolId: 'us-west-2_CGd9Wq136', // development
  userPoolAppClientId: '2u6s7pqkc1grq1qs464fsi82at', // development
  cognitoTokenFile: '.cognitoToken',
  awsRegion: 'us-west-2',
  webidBaseUrl: defer(function () { return `https://cognito-idp.${this.awsRegion}.amazonaws.com` }), // no trailing slash
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
