FROM node:13.12.0-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY . ./
ENV REACT_APP_SKWAL_WEBSOCKET_HOST=ws://127.0.0.1:8001/
RUN npm i -g serve
RUN npm ci --silent
RUN npm run build
CMD ["serve", "-s", "build"]

EXPOSE 5000