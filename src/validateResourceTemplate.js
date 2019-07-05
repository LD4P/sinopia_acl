import Ajv from 'ajv'
import config from 'config'

const util = require('util')
const fetch = require('node-fetch')

export default class ValidateResourceTemplate {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
    })
  }

  async validate(template) {
    let status = ''
    try {
      await this.promiseTemplateValidated(template, this.schemaUrl(template)).then(() => status = 'valid')
    } catch (err) {
      console.error(`ERROR - CANNOT USE PROFILE/RESOURCE TEMPLATE: problem parsing JSON template: ${err}`)
      status = 'invalid'
    }
    return status
  }

  schemaUrl(template) {
    let schemaUrl = template.schema || (template.Profile && template.Profile.schema)

    if (schemaUrl === undefined) {
      if (template.Profile) {
        schemaUrl = `https://ld4p.github.io/sinopia/schemas/${config.get('defaultProfileSchemaVersion')}/profile.json`
      } else {
        schemaUrl = `https://ld4p.github.io/sinopia/schemas/${config.get('defaultProfileSchemaVersion')}/resource-template.json`
      }
      console.error(`No schema url found in template. Using ${schemaUrl}`)
    }

    return schemaUrl
  }

  promiseTemplateValidated(template, schemaUrl) {
    return new Promise((resolve, reject) => this.promiseSchemasLoaded(schemaUrl)
      .then(() => {
        const isValid = this.ajv.validate(schemaUrl, template)
        if (!isValid) {
          return reject(new Error(`${util.inspect(this.ajv.errors)}`))
        }
        return resolve()
      }).catch(err => reject(err)))
  }

  promiseSchemasLoaded(schemaUrl) {
    return new Promise((resolve, reject) => {
      try {
        const schemaFunction = this.ajv.getSchema(schemaUrl)
        if (!schemaFunction) {
          this.fetchSchemaObjectsPromise(schemaUrl)
            .then((schemaObjs) => {
              schemaObjs.forEach((schemaObj) => {
                this.ajv.addSchema(schemaObj, schemaObj.id)
              })
            })
            .then(() => {
              resolve()
            }).catch(err => {
              if (err.toString().indexOf('already exists') > 0) {
                resolve()
              }
            })
        } else {
          resolve()
        }
      } catch (err) {
        reject(new Error(`error getting json schemas ${err}`))
      }
    })
  }

  fetchSchemaObjectsPromise(schemaUrl) {
    const schemaPrefixWithVersion = schemaUrl.match(/^(.*\d\.\d\.\d).*$/)[1]
    const schemaSuffixes = [
      'profile.json',
      'resource-templates-array.json',
      'resource-template.json',
      'property-templates-array.json',
      'property-template.json',
    ]
    const schemaFetchPromises = []

    schemaSuffixes.forEach(schemaSuffix => {
      const url = `${schemaPrefixWithVersion}/${schemaSuffix}`

      try {
        schemaFetchPromises.push(this.fetchJsonPromise(url))
      } catch (err) {
        console.error(err)
      }
    })

    return Promise.all(schemaFetchPromises)
  }

  fetchJsonPromise(uri) {
    return new Promise((resolve, reject) => {
      fetch(uri)
        .then(resp => {
          if (resp.ok) {
            resp.json()
              .then(data => {
                resolve(data)
              })
              .catch(err => { reject(new Error(`Error parsing json ${uri} - ${err}`)) })
          } else {
            reject(new Error(`HTTP error fetching ${uri}: ${resp.status} - ${resp.statusText}`))
          }
        })
        .catch(err => {
          reject(new Error(`Error fetching ${uri} - ${err}`))
        })
    })
  }

}
