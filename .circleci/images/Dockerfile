FROM circleci/node:12.8.0-stretch-browsers

RUN ls /etc/apt/

RUN echo "deb http://httpredir.debian.org/debian stretch-backports main" | sudo tee -a /etc/apt/sources.list \
 && echo "deb http://security.debian.org/debian-security jessie/updates main" | sudo tee -a /etc/apt/sources.list \
 && sudo dpkg --add-architecture i386 \
 && sudo apt-get update && sudo apt-get upgrade \
 && sudo apt-get install -y \
      wine/stretch-backports \
      wine32/stretch-backports \
      wine64/stretch-backports \
      libwine/stretch-backports \
      libwine:i386/stretch-backports \
      fonts-wine/stretch-backports\
      libssl1.0.0\
      libssl-dev\
      libgtk2.0-0 \
      libnotify-dev \
      libgconf-2-4 \
      libnss3 \
      libxss1 \
      libasound2 \
      xvfb

LABEL com.circleci.preserve-entrypoint=true
