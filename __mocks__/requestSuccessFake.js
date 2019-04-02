export default class RequestSuccessFake {
  post(_headers, _body) {
    return { statusCode: 201 }
  }
}
