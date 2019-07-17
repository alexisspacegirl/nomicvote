FROM node:alpine
LABEL maintainer="adamhovorka@gmail.com"
WORKDIR /usr/src/app
#RUN apk add --no-cache tini # Or `docker run --init`
#ENTRYPOINT ["/sbin/tini", "--"]
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE $PORT
#USER node
#CMD ["npm", "start"]
CMD ["node", "app.js"]

COPY package*.json ./
#RUN npm install
RUN npm ci --only=production

COPY . .
