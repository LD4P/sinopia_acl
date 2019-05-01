FROM circleci/node:10.15

WORKDIR /home/circleci

COPY . .

USER root

# Allow circleci user to run babel-node executable
RUN /bin/bash -c 'chown -R circleci node_modules'

USER circleci

RUN npm install
