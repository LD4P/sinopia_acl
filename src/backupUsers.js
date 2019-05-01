import AWS from 'aws-sdk'
import { backupUsers } from 'cognito-backup-restore'
import config from 'config'

AWS.config.update({ region: config.get('awsRegion') })

AWS.config.credentials = new AWS.Credentials({
  accessKeyId: config.get('awsAccessKey'), secretAccessKey: config.get('awsAccessSecret')
})

const cognitoISP = new AWS.CognitoIdentityServiceProvider();

backupUsers(cognitoISP, 'all', '.')
  .then(() => console.log(`Backup completed`))
  .catch(console.error)
