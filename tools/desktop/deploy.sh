#!/usr/bin/env bash
apt-get install rsync

ssh-keyscan -H ssh.ffxivteamcraft.com >> ~/.ssh/known_hosts

rsync -avz ./release/squirrel-windows/* dalamud@ssh.ffxivteamcraft.com:~/update.ffxivteamcraft.com/
