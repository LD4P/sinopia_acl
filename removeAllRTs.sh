#!/usr/bin/env bash

source ~/.sinopiarc

./cognito_login.exp

ID_TOKEN=`cat .cognitoToken`

echo "Using ID_TOKEN ${ID_TOKEN}"
echo ""

curl -H "Accept:application/ld+json" ${TRELLIS_BASE_URL}/repository/${SINOPIA_GROUP}| jq -r .contains[] > rts.txt

for URI in `cat rts.txt`; do
  echo "removing $URI"
  curl -X DELETE -H "Authorization: Bearer $ID_TOKEN" $URI
done
