FROM circleci/node:8.11-stretch-browsers

RUN ls /etc/apt/

RUN echo "deb http://httpredir.debian.org/debian stretch-backports main" | sudo tee -a /etc/apt/sources.list \
 && dpkg --add-architecture i386 \
 && sudo apt-get update \
 && sudo apt-get install wine wine32 \
      wine/stretch-backports \
      wine64/stretch-backports \
      libwine/stretch-backports \
      fonts-wine/stretch-backports

LABEL com.circleci.preserve-entrypoint=true
