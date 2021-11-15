FROM zenika/alpine-chrome:89-with-node-14

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
WORKDIR /usr/src/app
USER chrome
# Copy local code to the container image.
COPY ./ssr/ ./ssr/
COPY ./dist/ ./ssr/dist/
USER root
RUN chown -R chrome:chrome /usr/src/app
USER chrome
# Install production dependencies.
WORKDIR /usr/src/app/ssr
RUN yarn --frozen-lockfile
RUN yarn prefetch-data
# Run the web service on container startup.
CMD [ "yarn", "start" ]
