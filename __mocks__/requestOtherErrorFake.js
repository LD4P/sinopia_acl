export default class RequestOtherErrorFake {
  post(_headers, _body) {
    return { statusCode: 500, body: 'internal server error' }
  }
}
