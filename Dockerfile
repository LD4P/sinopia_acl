FROM circleci/node:10.15

WORKDIR /home/circleci

COPY . .

RUN npm install
