// NOTE:  script needs AWS Cognito user pool account with sufficient permissions to get info for a diff user
//
//  these env vars must be set:
//    COGNITO_ADMIN_USER
//    COGNITO_ADMIN_PASSWORD
//  and either:
//     AWS_PROFILE
//   or
//     AWS_ACCESS_KEY_ID and
//     AWS_SECRET_ACCESS_KEY
//
//  also
//    TRELLIS_BASE_URL
//
//  if not being run for AWS Cognito development pool, authenticateClient needs these:
//    COGNITO_USER_POOL_ID
//    COGNITO_CLIENT_ID
//    AWS_REGION
//    AWS_COGNITO_DOMAIN

import config from 'config'
import fs from 'fs'
import Mustache from 'mustache'
import request from 'sync-request'
import sleep from 'sleep'
import AuthenticateClient from './authenticateClient'

const baseUrl = Boolean(process.env.INSIDE_CONTAINER) ? 'http://platform:8080' : config.get('baseUrl')

const client = new AuthenticateClient(config.get('cognitoAdminUser'), config.get('cognitoAdminPassword'))
async function getToken() {
  await client.cognitoTokenToFile()
}

getToken()

const cogTokenFile = config.get('cognitoTokenFile')
const token = (fs.existsSync(cogTokenFile)) ?
  fs.readFileSync(cogTokenFile, 'utf8').trim() :
  ''

const renderTemplateFile = (templatePath, templateValues) => {
  const template = fs.readFileSync(templatePath, 'utf8')
  return Mustache.render(template, templateValues)
}


console.log('creating root container')

request('PATCH', baseUrl, {
  headers: {
    'Content-Type': 'application/sparql-update',
    'Authorization': `Bearer ${token}`
  },
  body: fs.readFileSync('./fixtureWAC/rootContainer.sparql', 'utf8')
})

// Pause between requests to give Trellis time to persist data
sleep.msleep(500)


console.log('creating repository container')

let response = request('HEAD', `${baseUrl}/repository`)

if (response.statusCode == 404) {
  request('POST', baseUrl, {
    headers: {
      'Content-Type': 'text/turtle',
      'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
      'Slug': 'repository',
      'Authorization': `Bearer ${token}`
    },
    body: fs.readFileSync('./fixtureWAC/repositoryContainer.ttl')
  })
} else {
  request('PATCH', `${baseUrl}/repository`, {
    headers: {
      'Content-Type': 'application/sparql-update',
      'Authorization': `Bearer ${token}`
    },
    body: fs.readFileSync('./fixtureWAC/repositoryContainer.sparql', 'utf8')
  })
}


Object.entries(config.get('groups')).forEach(([slug, label]) => {
  console.log(`creating ${slug} group container`)

  response = request('HEAD', `${baseUrl}/repository/${slug}`)

  if (response.statusCode == 404) {
    request('POST', `${baseUrl}/repository`, {
      headers: {
        'Content-Type': 'text/turtle',
        'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
        'Slug': slug,
        'Authorization': `Bearer ${token}`
      },
      body: renderTemplateFile('./fixtureWAC/groupContainer.ttl.mustache', {
        label: label
      })
    })
  } else {
    request('PATCH', `${baseUrl}/repository/${slug}`, {
      headers: {
        'Content-Type': 'application/sparql-update',
        'Authorization': `Bearer ${token}`
      },
      body: renderTemplateFile('./fixtureWAC/groupContainer.sparql.mustache', {
        label: label
      })
    })
  }
})


// Do ACLs last, i.e., *after* creating containers, else we require a valid JWT for the above operations
console.log('setting root container ACLs')

async function adminUserWebids() {
  return await Promise.all(config.get('adminUsers').map(adminUserName => client.webId(adminUserName)))
}

async function doRootAclRequest() {
  const adminWebids = await adminUserWebids()
  request('PATCH', `${baseUrl}/?ext=acl`, {
    headers: {
      'Content-Type': 'application/sparql-update',
      'Authorization': `Bearer ${token}`
    },
    body: renderTemplateFile(
      './fixtureWAC/rootWAC.sparql.mustache',
      {
        adminAgents: adminWebids.map(webid => {
          return `    </#control> acl:agent <${webid}> .`
        }).join("\n")
      }
    )
  })
}

doRootAclRequest()
