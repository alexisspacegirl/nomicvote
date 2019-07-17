#!/bin/bash

docker rm -f nomicvote &>/dev/null
docker build -qt nomicvote:latest . | sed 's/^sha256://'
docker run -d --init --rm -p 8080:8080 --name nomicvote nomicvote:latest
if [[ "$1" = "-f" ]]; then docker logs -f nomicvote; fi

#docker run -d --init -p 8080:8080 \
#  -m "300M" --memory-swap "1G" \
#  --name "nomicvote" \
#  --restart always \
#  nomicvote:latest

#PORT=8080 NODE_ENV=production node app.js
