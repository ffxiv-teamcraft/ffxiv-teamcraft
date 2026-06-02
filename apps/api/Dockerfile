# Use the official Node.js 20 image.
# https://hub.docker.com/_/node
FROM node:20-alpine
# Create and change to the app directory.
WORKDIR /usr/src/app
COPY --chown=node:node ./apps/api/package.json ./
RUN yarn
COPY --chown=node:node ./dist ./dist
# Run the web service on container startup.
CMD [ "node", "--max-old-space-size=8192", "dist/apps/api/main.js" ]
