FROM circleci/node:8.11-stretch-browsers

RUN ls /etc/apt/

RUN echo "deb http://httpredir.debian.org/debian stretch-backports main" | sudo tee -a /etc/apt/sources.list \
 && sudo dpkg --add-architecture i386 \
 && sudo apt-get update && sudo apt-get upgrade \
 && sudo apt-get install \
      wine/stretch-backports \
      wine32/stretch-backports \
      wine64/stretch-backports \
      libwine/stretch-backports \
      libwine:i386/stretch-backports \
      fonts-wine/stretch-backports

LABEL com.circleci.preserve-entrypoint=true
