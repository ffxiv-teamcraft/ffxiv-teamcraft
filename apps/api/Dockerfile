# Use the official Node.js 16 image.
# https://hub.docker.com/_/node
FROM node:16-alpine
# Create and change to the app directory.
WORKDIR /usr/src/app
COPY --chown=node:node ./dist ./dist
COPY --chown=node:node ./node_modules ./node_modules
# Run the web service on container startup.
CMD [ "node", "dist/apps/api/main.js" ]
