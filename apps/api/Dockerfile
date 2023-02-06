# Use the official Node.js 16 image.
# https://hub.docker.com/_/node
FROM node:16-alpine
# Create and change to the app directory.
WORKDIR /usr/src/app
COPY --chown=node:node ./apps/api/package.json ./
RUN yarn
COPY --chown=node:node ./dist ./dist
# Run the web service on container startup.
CMD [ "node", "dist/apps/api/main.js" ]
