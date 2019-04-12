import config from 'config'
import SinopiaClient from '../src/sinopiaClient'

// Fake out server requests
import RequestNotFoundErrorFake from '../__mocks__/requestNotFoundErrorFake'
import RequestAlreadyExistsErrorFake from '../__mocks__/requestAlreadyExistsErrorFake'
import RequestOtherErrorFake from '../__mocks__/requestOtherErrorFake'
import RequestSuccessFake from '../__mocks__/requestSuccessFake'

describe('SinopiaClient', () => {
  const client = new SinopiaClient()

  describe('constructor()', () => {
    test('returns instance with configured group container URL', () => {
      expect(client.groupContainerUrl).toEqual(`${config.get('baseUrl')}/repository`)
    })
  })
  describe('createGroup()', () => {
    const groupSlug = 'foobar'
    const consoleSpy = jest.spyOn(console, 'error')

    test('returns result of operation when successful', () => {
      client.requester = new RequestSuccessFake()
      const returned = client.createGroup(groupSlug)
      expect(consoleSpy).not.toHaveBeenCalled()
      expect(returned).toEqual(`${config.get('baseUrl')}/repository/${groupSlug}`)

    })
    test('logs an error when request is a 404', () => {
      client.requester = new RequestNotFoundErrorFake()
      const returned = client.createGroup(groupSlug)
      expect(consoleSpy).toHaveBeenCalledWith('error creating group: /repository container does not exist')
      expect(returned).toBeNull()
    })
    test('logs an error when request is a 409', () => {
      client.requester = new RequestAlreadyExistsErrorFake()
      const returned = client.createGroup(groupSlug)
      expect(consoleSpy).toHaveBeenCalledWith(`error creating group: '${groupSlug}' already exists`)
      expect(returned).toBeNull()
    })
    test('logs an error when request is a 500', () => {
      client.requester = new RequestOtherErrorFake()
      const returned = client.createGroup(groupSlug)
      expect(consoleSpy).toHaveBeenCalledWith('error creating group: (500) internal server error')
      expect(returned).toBeNull()
    })
  })
})
