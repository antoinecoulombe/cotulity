FROM node:lts-slim

LABEL maintainer="Antoine Coulombe"

RUN apt-get update && apt-get install curl -y

WORKDIR /app

COPY global/package*.json .

RUN npm install
RUN npm install -g sequelize-cli

COPY global/ .

WORKDIR /shared

COPY shared/package*.json .

RUN npm install

COPY shared/ .

WORKDIR /app

ENTRYPOINT ["npm"]
CMD ["start"]