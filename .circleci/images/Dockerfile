FROM circleci/node:8.11-stretch-browsers

RUN dpkg --add-architecture i386 && apt-get update && apt-get install wine32
RUN echo "deb http://httpredir.debian.org/debian stretch-backports main" > /etc/apt/sources.list.d/stretch-backports
RUN apt-get update
RUN apt-get install wine
RUN apt-get install \
      wine/jessie-backports \
      wine32/jessie-backports \
      wine64/jessie-backports \
      libwine/jessie-backports \
      libwine:i386/jessie-backports \
      fonts-wine/jessie-backports

LABEL com.circleci.preserve-entrypoint=true
