[![npm](https://img.shields.io/npm/v/sinopia_acl.svg)](https://www.npmjs.com/package/sinopia_acl)
[![CircleCI](https://circleci.com/gh/LD4P/sinopia_acl.svg?style=svg)](https://circleci.com/gh/LD4P/sinopia_acl)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1abbbb1e7eef5ad1a9a5/test_coverage)](https://codeclimate.com/github/LD4P/sinopia_acl/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1abbbb1e7eef5ad1a9a5/maintainability)](https://codeclimate.com/github/LD4P/sinopia_acl/maintainability)

# sinopia_acl
node.js based code to interact with WebACL data on Sinopia server.

WebACL (https://www.w3.org/wiki/WebAccessControl) is how we will gate access to various LDP containers on the server.

The "copy of record" of group/webID mappings will be in the Sinopia server.

## Prerequisites

You will need to install the npm packages before running any of the code (which also requires that the npm package manager itself is installed)

```shell
$ npm install
```

## Command Line

This code may have a simple CLI for Sinopia Server admins to use to be developed in a future work cycle (as of April, 2019).

### Spinning up Trellis LDP Server

To spin up Trellis and its dependencies with the Sinopia container structure (root, repository, and group containers) and ACLs (declared on root container) pre-created, use the `platformdata` docker-compose service:

```shell
# Add -d flag to run containers in background
$ docker-compose up platformdata
```

**NOTE**: In order for the above to work, you will need to set `COGNITO_ADMIN_PASSWORD`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` in a file named `.env` in the sinopia_acl root.

To spin up Trellis and its dependencies without the container structure and ACLs pre-created, use the `platform` docker-compose service:

```shell
# Add -d flag to run containers in background
$ docker-compose up platform
```

### Migration Script to Populate existing Trellis LDP Server with Sinopia container structure and ACLs

There is a script to populate a running Trellis LDP server with the Sinopia container structure (root, repository, and group containers) and ACLs (declared on root container).

This script can be run repeatedly
 - it copes with containers if they already exist
 - it will overwrite the existing ACL for the root container (requires COGNITO_ADMIN_USER to already be on existing root ACL, tho!)

#### Requirements:

- an AWS Cognito Sinopia user pool account with sufficient permissions to get info about a different user in the pool.

These env vars must be set:
- COGNITO_ADMIN_USER  (defaults to sinopia-devs_client-tester)
- COGNITO_ADMIN_PASSWORD
- one of:
    - AWS_PROFILE
   or
    - AWS_ACCESS_KEY_ID and
    - AWS_SECRET_ACCESS_KEY
- TRELLIS_BASE_URL  (defaults to http://localhost:8080)

If the desired AWS Cognito pool is not the Cognito Sinopia development pool, these env vars are also needed:
- COGNITO_USER_POOL_ID
- COGNITO_CLIENT_ID
- AWS_REGION
- AWS_COGNITO_DOMAIN

#### Example:

```shell
$ COGNITO_ADMIN_USER=hoohah COGNITO_ADMIN_PASSWORD=foobar AWS_PROFILE=barfoo bin/migrate
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
$ COGNITO_ADMIN_PASSWORD=foobar AWS_PROFILE=barfoo npm test
```

Note that you will need to replace the value of
-  `COGNITO_ADMIN_PASSWORD` with the actual password of the Cognito testing account we have created. For that, see the Sinopia dev `shared_configs` [repository](https://github.com/sul-dlss/shared_configs/tree/sinopia-dev) or ask a fellow Sinopia developer.
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

- We separate out the CLI from the WebACL manipulation and the interaction with the Sinopia server.

- We will see if we can use npm jsonacl https://www.npmjs.com/package/jsonacl for node ACL manipulation, or something similar

- We publish an npm package that can be imported by a GUI

## Build and push image

The CircleCI build is configured to perform these steps automatically on any successful build on the `master` branch. If you need to manually build and push an image, you can do this:

```shell
$ docker build -t ld4p/sinopia_acl:latest .
$ docker push ld4p/sinopia_acl:latest
```
