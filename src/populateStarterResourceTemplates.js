import GitHub from 'github-api'
import request from 'sync-request'
import config from 'config'
import ValidateResourceTemplate from './validateResourceTemplate'

/*
 * Use lodash for safe navigation in getShaByName() and to avoid the security/detect-object-injection eslint warning
 * caused by the use of square bracket notation e.g. (obj[key])
 */
const _ = require('lodash')

export default class PopulateStarterResourceTemplates {
  constructor(token) {
    //get cognito token from calling script
    this.token = token
    // const gh = new GitHub()
    const gh = new GitHub({ username: process.env.GITHUB_USER, password: process.env.GITHUB_PASS })
    this.repo = gh.getRepo(config.get('templateOrg'), config.get('templateRepo'))
    this.resourceTemplateShas = []
    // trellis base url
    this.baseUrl = process.env.INSIDE_CONTAINER ? 'http://platform:8080' : config.get('baseUrl')
    // for json validation
    this.validateResourceTemplate = new ValidateResourceTemplate()
  }

  /**
   * Uses the github api to get the latest master branch sha of sinopia_sample_profiles for the 'profiles' dir
   * See http://github-tools.github.io/github/docs/3.1.0/Repository.html#getContents
   */
  async getRepoContents() {
    let sha = ''
    await this.repo.getContents(config.get('templateBranch'), config.get('templatePath'), true)
      .then(response => {
        sha = this.getShaByName(config.get('templateFolder'), response.data)
      }).catch(err => {
        console.error(err.response.data)
      })
    return sha
  }

  /**
   * @param folderName
   * @param dataArray
   * @return the sha from the object matching the folder name
   */
  getShaByName(folderName, dataArray) {
    return dataArray[_.findIndex(dataArray, {'name': folderName})].sha
  }

  /**
   * Uses the github api to get the directory tree listing of 'profiles' based on the given sha
   * @param sha
   */
  async getRepoTree(sha) {
    let tree = {}
    await this.repo.getTree(sha).then(response => {
      tree = response
    })
    return tree
  }

  /**
   * Uses the github api to get the blob contents of a given sha from the tree
   * @param sha
   */
  async getResourceTemplate(sha) {
    let blob = {}
    await this.repo.getBlob(sha).then(response => {
      blob = response
    })
    return blob
  }

  /**
   * Calls the other github api methods to drill down to the specific file shas and
   * adds those json objects to a globally scoped array
   */
  async getResourceTemplateShas() {
    await this.getRepoContents()
      .then(sha => this.getRepoTree(sha))
      .then(dataTree => {
        const path = dataTree.data.tree
        path.forEach(obj => {
          if (obj.type === 'blob' && obj.path.match(/\.json/g)) {
            this.resourceTemplateShas.push(obj.sha)
          }
        })
      }).catch(err => {
        console.error(err.response.data)
      })
  }

  /**
   * Reads the passed in resource template and persists it to the trellis ld4p repository container via PUT
   * @param resourceTemplate
   */
  postResourceTemplatesToTrellis(resourceTemplate) {
    const headers = {
      'Content-Type': 'application/json',
      'Link': '<http://www.w3.org/ns/ldp#NonRDFSource>; rel="type"',
      'Slug': `${resourceTemplate.id}`,
      'Authorization': `Bearer ${this.token}`
    }
    try {
      const response = request('PUT', `${this.baseUrl}/repository/ld4p`, {
        headers: headers,
        body: JSON.stringify(resourceTemplate),
      })

      if(response.statusCode === 409) {
        console.info(`Updating ${this.baseUrl}/repository/ld4p/${resourceTemplate.id}`)
        request('PUT', `${this.baseUrl}/repository/ld4p/${resourceTemplate.id}`, {
          headers: headers,
          body: JSON.stringify(resourceTemplate),
        })
      } else {
        console.info(`Added ${this.baseUrl}/repository/ld4p/${resourceTemplate.id}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async starterResourceTemplates() {
    await this.getResourceTemplateShas().then(() => {
      this.resourceTemplateShas.forEach(async fileSha => {
        await this.getResourceTemplate(fileSha).then(async blob => {
          const profile = blob.data
          profile.Profile.resourceTemplates.forEach(async resourceTemplate => {
            await this.validateResourceTemplate.validate(resourceTemplate).then(status =>{
              if (status === 'valid') {
                this.postResourceTemplatesToTrellis(resourceTemplate)
              } else if (status === 'invalid') {
                console.error(`FAILED to POST ${this.baseUrl}/repository/ld4p/${resourceTemplate.id}`)
              }
            })
          })
        })
      })
    })
  }

}
