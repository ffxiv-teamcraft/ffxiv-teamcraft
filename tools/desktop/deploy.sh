#!/usr/bin/env bash

sudo apt-get install rsync

mkdir ~/.ssh
touch ~/.ssh/known_hosts

ssh-keyscan -H ssh.ffxivteamcraft.com >> ~/.ssh/known_hosts

rsync -avz ./release/squirrel-windows/* dalamud@ssh.ffxivteamcraft.com:~/update.ffxivteamcraft.com/
