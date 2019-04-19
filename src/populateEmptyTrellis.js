// NOTE:  script assumes
//  1) there is a valid AWS Cognito token available.
//  You can populate this file via `bin/authenticate`, at which point you will
//  be prompted for a Sinopia Cognito pool username and password.
//  2) AWS_PROFILE and AUTH_TEST_PASS will be set -- these allow us to use authenticateClient.webId(username)

import config from 'config'
import fs from 'fs'
import Mustache from 'mustache'
import request from 'sync-request'
import sleep from 'sleep'
import AuthenticateClient from './authenticateClient'

const baseUrl = Boolean(process.env.INSIDE_CONTAINER) ? 'http://platform:8080' : config.get('baseUrl')

// FIXME: see github issue #63
//  eventually, we will have adminusername and adminpassword from ENV vars so we should
//  obtain our own cognito token.
//  we will also get appropriate AWS_ACCESS_KEY_ID and  AWS_SECRET_ACCESS_KEY, which should allow us to
//  use AWS SDK to get webid from username


const renderTemplateFile = (templatePath, templateValues) => {
  const template = fs.readFileSync(templatePath, 'utf8')
  return Mustache.render(template, templateValues)
}

const cogTokenFile = config.get('cognitoTokenFile')
console.log(`retrieving token from ${cogTokenFile}`)

const token = (fs.existsSync(cogTokenFile)) ?
  fs.readFileSync(cogTokenFile, 'utf8').trim() :
  ''

console.log('creating root container')

request('PATCH', baseUrl, {
  headers: {
    'Content-Type': 'application/sparql-update',
    'Authorization': `Bearer ${token}`
  },
  body: fs.readFileSync('./fixtureWAC/rootContainer.sparql', 'utf8')
})

// Pause between requests to give Trellis time to persist data
sleep.sleep(1)

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

// FIXME:  will remove these hardcoded values in github issue #63
// const username = config.get('testUser')  // no testUser in default.js
const username = 'sinopia-devs_client-tester'
const password = process.env.AUTH_TEST_PASS

const client = new AuthenticateClient(username, password)

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
