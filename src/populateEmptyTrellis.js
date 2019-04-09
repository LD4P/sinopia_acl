import config from 'config'
import fs from 'fs'
import Mustache from 'mustache'
import request from 'sync-request'

const renderTemplateFile = (templatePath, templateValues) => {
  const template = fs.readFileSync(templatePath, 'utf8')
  return Mustache.render(template, templateValues)
}

console.log('creating root container')

request('PUT', config.baseUrl, {
  headers: {
    'Content-Type': 'text/turtle'
  },
  body: fs.readFileSync('./fixtureWAC/rootContainer.ttl', 'utf8')
})

console.log('creating repository container')

request('POST', config.baseUrl, {
  headers: {
    'Content-Type': 'text/turtle',
    'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
    'Slug': 'repository'
  },
  body: fs.readFileSync('./fixtureWAC/repositoryContainer.ttl')
})

console.log('creating ld4p group container')

request('POST', `${config.baseUrl}/repository`, {
  headers: {
    'Content-Type': 'text/turtle',
    'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
    'Slug': 'ld4p'
  },
  body: fs.readFileSync('./fixtureWAC/groupLd4pContainer.ttl')
})

// Do ACLs last, i.e., *after* creating containers, else we need a valid JWT for the above operations
console.log('setting root container ACLs')

request('PUT', `${config.baseUrl}/?ext=acl`, {
  headers: {
    'Content-Type': 'text/turtle'
  },
  body: renderTemplateFile('./fixtureWAC/rootWAC.mustache', {
    adminAgents: config.adminUsers.map(webid => {
      return `        acl:agent     <${webid}> ;`
    }).join("\n")
  })
})
