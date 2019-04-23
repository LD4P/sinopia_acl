import config from 'config'
import SimpleRequest from './simpleRequest'

export default class SinopiaClient {
  constructor() {
    this.trellisBaseUrl = config.get('baseUrl')
    this.groupContainerUrl = `${this.trellisBaseUrl}/repository`
    this.requester = new SimpleRequest(this.groupContainerUrl)
  }

  createGroup(slug) {
    try {
      const response = this.requester.post({
        'link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
        'content-type': 'application/ld+json',
        'slug': slug
      }, `{
        "@context": { "rdfs": "http://www.w3.org/2000/01/rdf-schema#" },
        "@id": "",
        "rdfs:label": "Container for ${slug} group"
      }`)

      switch(response.statusCode) {
        case 201:
          console.log(`group '${this.groupContainerUrl}/${slug}' created successfully`)
          return `${this.groupContainerUrl}/${slug}`
        case 404:
          throw `/repository container does not exist`
        case 409:
          throw `'${slug}' already exists`
        default:
          throw `(${response.statusCode}) ${response.body.toString()}`
      }
    } catch(error) {
      console.error(`error creating group: ${error}`)
      return null
    }
  }
}
