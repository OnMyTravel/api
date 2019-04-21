FROM node:8

RUN mkdir /app
WORKDIR /app
ADD package.json /app/package.json
RUN npm install
ADD . /app
# ADD ./app /app

# RUN mkdir ./config
# ADD ./config /app/config

# ADD ./index.js /app

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

CMD /wait && npm start