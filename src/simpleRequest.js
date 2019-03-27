import request from 'sync-request'

export default class SimpleRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  post(headers, body) {
    return request('POST', this.baseUrl, {
      headers: headers,
      body: body
    })
  }
}
