// This allows parts of the config to refer to others
const defer = require('config/defer').deferConfig

module.exports = {
  // This is a list of WebIDs from the Sinopia Cognito user pool (in development
  // environment). The IDs in this list are, in no order, for:
  //
  // * mjgiarlo
  // * jpnelson
  // * ndushay
  // * michellef
  // * suntzu
  //
  // (could not find account for jgreben)
  adminUsers: defer(function () {
    return [
      '62748a6a-3a53-4b4c-976d-aac6062d594b',
      '90c16e02-3fdd-4459-968e-f4795b682bd0',
      '11a584b8-2ae5-4fd1-b8a1-e28976c48132',
      '56b84999-793f-4fa6-ad20-be8f62a5c2de',
      '2586583c-44bd-4d3c-9a6a-0d94510be5ea'
    ].map(sub => {
      return `${this.webidBaseUrl}/${this.userPoolId}/${sub}`
    })
  }),
  baseUrl: 'http://localhost:8080',
  // authorization
  userPoolId: 'us-west-2_CGd9Wq136',
  userPoolAppClientId: '2u6s7pqkc1grq1qs464fsi82at',
  cognitoTokenFile: '.cognitoToken',
  webidBaseUrl: 'https://cognito-idp.us-west-2.amazonaws.com',
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
