import config from 'config'
import fs from 'fs'
import Mustache from 'mustache'
import request from 'sync-request'
import sleep from 'sleep'

const renderTemplateFile = (templatePath, templateValues) => {
  const template = fs.readFileSync(templatePath, 'utf8')
  return Mustache.render(template, templateValues)
}

console.log(`retrieving token from ${config.cognitoTokenFile}`)

const token = (fs.existsSync(config.cognitoTokenFile)) ?
  fs.readFileSync(config.cognitoTokenFile, 'utf8').trim() :
  ''

console.log('creating root container')

request('PATCH', config.baseUrl, {
  headers: {
    'Content-Type': 'application/sparql-update',
    'Authorization': `Bearer ${token}`
  },
  body: fs.readFileSync('./fixtureWAC/rootContainer.sparql', 'utf8')
})

// Pause between requests to give Trellis time to persist data
sleep.sleep(1)

console.log('creating repository container')

let response = request('HEAD', `${config.baseUrl}/repository`)

if (response.statusCode == 404) {
  request('POST', config.baseUrl, {
    headers: {
      'Content-Type': 'text/turtle',
      'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
      'Slug': 'repository',
      'Authorization': `Bearer ${token}`
    },
    body: fs.readFileSync('./fixtureWAC/repositoryContainer.ttl')
  })
} else {
  request('PATCH', `${config.baseUrl}/repository`, {
    headers: {
      'Content-Type': 'application/sparql-update',
      'Authorization': `Bearer ${token}`
    },
    body: fs.readFileSync('./fixtureWAC/repositoryContainer.sparql', 'utf8')
  })
}

Object.entries(config.groups).forEach(([slug, label]) => {
  // Pause between requests to give Trellis time to persist data
  sleep.sleep(1)

  console.log(`creating ${slug} group container`)

  response = request('HEAD', `${config.baseUrl}/repository/${slug}`)

  if (response.statusCode == 404) {
    request('POST', `${config.baseUrl}/repository`, {
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
    request('PATCH', `${config.baseUrl}/repository/${slug}`, {
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

// Pause between requests to give Trellis time to persist data
sleep.sleep(1)

// Do ACLs last, i.e., *after* creating containers, else we require a valid JWT for the above operations
console.log('setting root container ACLs')

request('PATCH', `${config.baseUrl}/?ext=acl`, {
  headers: {
    'Content-Type': 'application/sparql-update',
    'Authorization': `Bearer ${token}`
  },
  body: renderTemplateFile('./fixtureWAC/rootWAC.sparql.mustache', {
    adminAgents: config.adminUsers.map(webid => {
      return `    </#control> acl:agent <${webid}> .`
    }).join("\n")
  })
})
