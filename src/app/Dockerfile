
# Stage 1: Build the Node.js application
FROM node:18-alpine as node_build

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3001
EXPOSE 3002

# enable below for live changes watching 

CMD ["npm","run","docker_watch"] 

