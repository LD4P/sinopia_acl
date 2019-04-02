export default class RequestAlreadyExistsErrorFake {
  post(_headers, _body) {
    return { statusCode: 409 }
  }
}
