[![npm](https://img.shields.io/npm/v/sinopia_acl.svg)](https://www.npmjs.com/package/sinopia_acl)
[![CircleCI](https://circleci.com/gh/LD4P/sinopia_acl.svg?style=svg)](https://circleci.com/gh/LD4P/sinopia_acl)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1abbbb1e7eef5ad1a9a5/test_coverage)](https://codeclimate.com/github/LD4P/sinopia_acl/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1abbbb1e7eef5ad1a9a5/maintainability)](https://codeclimate.com/github/LD4P/sinopia_acl/maintainability)

# sinopia_acl
node.js based code to interact with WebACL data on Sinopia server

WebACL (https://www.w3.org/wiki/WebAccessControl) is how we will gate access to various LDP containers on the server.

The "copy of record" of group/webID mappings will be in the Sinopia server.

## Command Line

This code will have a simple CLI for Sinopia Server admins to use, to be developed in a future work cycle (as of April, 2019).

It will expect the admin user to have a valid JWT in a .cognitoToken file (to allow Trellis to know the admin user has permisssions to make the changes to WebACL data). You can populate this file via `bin/authenticate`, at which point you will be prompted for your Sinopia Cognito pool username and password.

To spin up Trellis and its dependencies with the Sinopia container structure (root, repository, and group containers) and ACLs (declared on root container) pre-created, you can do using the `platformdata` docker-compose service:

```shell
# Add -d flag to run containers in background
$ docker-compose up platformdata
```

## Testing

### Linter

To run the linter:

```shell
$ npm run eslint
```

### Unit tests

To run unit tests:

```shell
$ AUTH_TEST_PASS=foobar AWS_PROFILE=barfoo npm test
```

Note that you will need to replace the value of
-  `AUTH_TEST_PASS` with the actual password of the Cognito testing account we have created. For that, see the Sinopia dev `shared_configs` [repository](https://github.com/sul-dlss/shared_configs/tree/sinopia-dev) or ask a fellow Sinopia developer.
- `AWS_PROFILE` with the value of your developer profile, e.g. 'dev' or 'my-id@sul-dlss-dev'

### Integration

If you're going to be doing active development, you'll most likely want to spin up `docker-compose` services and run integration tests separately, since you will do this multiple times while getting the code right. If so, first spin up the integration environment—Trellis & its dependencies—in the background (via `-d`) using `docker-compose`:

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

Or if you just need to run the integration tests once (assuming you haven't already started up `docker-compose` services), you can do the following to spin up containers, run integration tests, and then spin containers down. (This is how integration tests are run in CI.)

```shell
$ docker-compose run integration
$ docker-compose down
```

## Development Principles:

- Any commands that are in the swagger spec (e.g. listing groups, creating group) should use the sinopia_client npm module rather than curl, if possible. (swagger api -> javascript client -> npm module)

- testing/development will benefit from a docker env with a running Sinopia Server backend with Trellis (e.g. sinopia_server docker used for testing)

- In an ideal world, we would validate any WebACL to be written to the server.  However, here does not seem to be an existing WebACL validation package -- JSON schema, npm module, RDF shapes, whatever.

- We will separate out the CLI from the WebACL manipulation and the interaction with the Sinopia server.
    There are npm packages for CLI that we can leverage, such as cli, minimist, ...

- We will see if we can use npm jsonacl https://www.npmjs.com/package/jsonacl for node ACL manipulation, or something similar

- We will (eventually) create an npm package that could then be imported in the future by a GUI
    team members will need to be added to npm registry when we create npm package

## Build and push image

The CircleCI build is configured to perform these steps automatically on any successful build on the `master` branch. If you need to manually build and push an image, you can do this:

```shell
$ docker build -t ld4p/sinopia_acl:latest .
$ docker push ld4p/sinopia_acl:latest
```
