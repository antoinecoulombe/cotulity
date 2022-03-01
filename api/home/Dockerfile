FROM node:lts-slim

LABEL maintainer="Antoine Coulombe"

WORKDIR /app

COPY home/package*.json .

RUN npm install
RUN npm install -g sequelize-cli

COPY home/ .

WORKDIR /shared

COPY shared/package*.json .

RUN npm install

COPY shared/ .

WORKDIR /app

CMD ["npm", "start"]