FROM node:lts-slim

LABEL maintainer="Antoine Coulombe"
ENV CI=true

RUN apt-get update && apt-get install curl -y

WORKDIR /app

COPY test/package*.json .

RUN npm install
RUN npm install -g sequelize-cli

COPY test/ .

WORKDIR /shared

COPY shared/package*.json .

RUN npm install

COPY shared/ .

WORKDIR /app

ENTRYPOINT ["npm"]
CMD ["start"]