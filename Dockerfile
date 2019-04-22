FROM node:10

RUN mkdir -p /src/app
WORKDIR /src/app
ADD package.json /src/app/package.json
RUN npm install
RUN npm i -g nodemon
ADD . /src/app

CMD npm start