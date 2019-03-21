[![CircleCI](https://circleci.com/gh/LD4P/sinopia_acl.svg?style=svg)](https://circleci.com/gh/LD4P/sinopia_acl)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1abbbb1e7eef5ad1a9a5/test_coverage)](https://codeclimate.com/github/LD4P/sinopia_acl/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1abbbb1e7eef5ad1a9a5/maintainability)](https://codeclimate.com/github/LD4P/sinopia_acl/maintainability)

# sinopia_acl
node.js based code to interact with WebACL data on Sinopia server

WebACL (https://www.w3.org/wiki/WebAccessControl) is how we will gate access to various LDP containers on the server.

The "copy of record" of group/webID mappings will be in the Sinopia server.


## Testing

To run the linter and unit tests:

```shell
$ npm run eslint
$ npm test
```

### Integration

First spin up the integration environment (Trellis, its dependencies, and this repo's code) using `docker-compose`:

```shell
$ docker-compose up -d platform
```

To run the integration tests, they must be invoked independent of the unit tests:

```shell
$ npm run jest-integration
```

To shut the containers down and clean up, run:

```shell
$ docker-compose down
```

Or to bundle the above commands (mimicking how integration tests are run in CI), you can invoke the integration tests via:

```shell
$ docker-compose run integration
$ docker-compose down
```

## Command Line

This code will have a simple CLI for Sinopia Server admins to use

It will expect the admin user to have a JWT in an .ENV file (to allow server to know the admin user has permisssions to make the changes to WebACL data).



## Development Principles:

- Any commands that are in the swagger spec (e.g. listing groups, creating group) should use the sinopia_client npm module rather than curl, if possible. (swagger api -> javascript client -> npm module)

- testing/development will benefit from a docker env with a running Sinopia Server backend with Trellis (e.g. sinopia_server docker used for testing)

- In an ideal world, we would validate any WebACL to be written to the server.  However, here does not seem to be an existing WebACL validation package -- JSON schema, npm module, RDF shapes, whatever.

- We will separate out the CLI from the WebACL manipulation and the interaction with the Sinopia server.
    There are npm packages for CLI that we can leverage, such as cli, minimist, ...

- We will see if we can use npm jsonacl https://www.npmjs.com/package/jsonacl for node ACL manipulation, or something similar

- We will (eventually) create an npm package that could then be imported in the future by a GUI
    team members will need to be added to npm registry when we create npm package
