FROM node:slim

LABEL maintainer="Antoine Coulombe"

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g typescript

COPY . .

CMD ["npm", "start"]
