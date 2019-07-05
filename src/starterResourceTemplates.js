import config from 'config'
import fs from 'fs'
import AuthenticateClient from './authenticateClient'
import PopulateStarterResourceTemplates from './populateStarterResourceTemplates'

// aws authentication client
const client = new AuthenticateClient(config.get('cognitoAdminUser'), config.get('cognitoAdminPassword'))

client.cognitoTokenToFile().then(() => null)
  .catch(error => {
    console.error(`could not retrieve token: ${error}`)
  })

const token = (fs.existsSync(config.get('cognitoTokenFile'))) ?
  fs.readFileSync(config.get('cognitoTokenFile'), 'utf8').trim() :
  ''

const populate = new PopulateStarterResourceTemplates(token)
populate.starterResourceTemplates()