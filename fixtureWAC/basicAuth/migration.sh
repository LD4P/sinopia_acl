#!/usr/bin/env bash
#
# run this script from top level of sinopia_acl, e.g.  ./fixtureWAC/basicAuth/migration.sh

echo 'begin root container'

curl -i -X PUT --data-binary @fixtureWAC/rootContainer.ttl -H "Content-Type:text/turtle" 'http://localhost:8080/'

# echo "root container after writing container fixture"
# curl http://localhost:8080/

curl -i -X PUT --data-binary @fixtureWAC/basicAuth/rootWAC.ttl -H "Content-Type:text/turtle" 'http://localhost:8080/?ext=acl'

# echo "root container ACL after writing WAC fixture"
# curl http://localhost:8080/?ext=acl

echo 'end root container'
echo '--------------------------'
echo 'begin repository container'

curl -i -X POST --data-binary @fixtureWAC/repositoryContainer.ttl -H 'Link: <http://www.w3.org/ns/ldp#BasicContainer>; rel="type"' -H "Content-Type:text/turtle" -H "Slug:repository" 'http://localhost:8080/' -u cmharlow:S3cr3t!

# echo "repository container after writing container fixture"
# curl http://localhost:8080/repository

curl -i -X PUT --data-binary @fixtureWAC/basicAuth/repositoryWAC.ttl -H "Content-Type:text/turtle" 'http://localhost:8080/repository?ext=acl' -u cmharlow:S3cr3t!

# echo "repository container ACL after writing WAC fixture"
# curl http://localhost:8080/repository?ext=acl -u cmharlow:S3cr3t!

echo 'end repository container'
echo '--------------------------'
echo 'begin ld4p container'

curl -i -X POST --data-binary @fixtureWAC/groupLd4pContainer.ttl -H 'Link: <http://www.w3.org/ns/ldp#BasicContainer>; rel="type"' -H "Content-Type:text/turtle" -H "Slug:ld4p" 'http://localhost:8080/repository' -u cmharlow:S3cr3t!

# echo "ld4p container after writing container fixture"
# curl http://localhost:8080/repository/ld4p

curl -i -X PUT --data-binary @fixtureWAC/basicAuth/groupLd4pWAC.ttl -H "Content-Type:text/turtle" 'http://localhost:8080/repository/ld4p?ext=acl' -u cmharlow:S3cr3t!

# echo "ld4p container ACL after writing WAC fixture"
# curl http://localhost:8080/repository/ld4p?ext=acl -u cmharlow:S3cr3t!

echo 'end ld4p container'
echo '--------------------------'
