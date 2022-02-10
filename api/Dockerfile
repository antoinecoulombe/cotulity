FROM node:lts-slim

LABEL maintainer="Antoine Coulombe"

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g sequelize-cli

COPY . .

CMD ["npm", "start"]