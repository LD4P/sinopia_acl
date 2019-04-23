import request from 'sync-request'
import { WebAccessControl } from '../src/webAccessControl'

const rootAclUrl = Boolean(process.env.INSIDE_CONTAINER) ? 'http://platform:8080/?ext=acl' : 'http://localhost:8080/?ext=acl'

// assumes docker-compose build is running
describe('populateEmptyTrellis integration', () => {
  test('root container WAC validates', async () => {
    console.log('IN TeST!!!!!!!')
    const rootWAC = await request('GET', rootAclUrl)
    console.dir(rootWAC.getBody('utf8'))

    // const rootNode = namedNode('http://platform:8080/#auth')
    const webAC = new WebAccessControl('', rootWAC.getBody('utf8'))
    expect(webAC.validates()).toBeTruthy()
  })

  test.skip('throws exception if unable to get webid for username', () => {

  })
})
