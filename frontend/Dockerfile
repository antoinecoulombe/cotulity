FROM node:slim

LABEL maintainer="Antoine Coulombe"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
