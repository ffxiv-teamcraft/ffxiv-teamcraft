#!/usr/bin/env bash

sudo apt-get install rsync

if [[ ! -d ~/.ssh ]]; then
  mkdir ~/.ssh
  chmod 700 ~/.ssh
  touch ~/.ssh/known_hosts
  chmod 600 ~/.ssh/known_hosts
fi

ssh-keyscan -H ssh.ffxivteamcraft.com >> ~/.ssh/known_hosts

rsync -avz ./release/squirrel-windows/* dalamud@ssh.ffxivteamcraft.com:~/update.ffxivteamcraft.com/
