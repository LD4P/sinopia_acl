export default class RequestNotFoundErrorFake {
  post(_headers, _body) {
    return { statusCode: 404 }
  }
}
