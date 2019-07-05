import PopulateStarterResourceTemplates from '../src/populateStarterResourceTemplates'

describe('PopulateStarterResourceTemplates', () => {
  test('getShaByName', () => {
    const githubContents = [
      {
        "name": "configuration_demo",
        "path": "configuration_demo",
        "sha": "c9828d69956b5998f339db1bd56785cbc874c07b",
      },
      {
        "name": "profiles",
        "path": "profiles",
        "sha": "b2c9e6918297eff9d501ec0a0deb859cb43a39f3",
      },
      {
        "name": "resourceTemplates",
        "path": "resourceTemplates",
        "sha": "53088a62d119773092d19b2c3711928fc626b043",
      },
    ]
    const starter = new PopulateStarterResourceTemplates()
    const expectedSha = starter.getShaByName('profiles', githubContents)
    expect(expectedSha).toEqual('b2c9e6918297eff9d501ec0a0deb859cb43a39f3')
  })


})
