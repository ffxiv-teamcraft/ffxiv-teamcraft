#!/usr/bin/env bash
ssh-keyscan -H ssh.ffxivteamcraft.com >> ~/.ssh/known_hosts

rsync -avz ./release/squirrel-windows/* dalamud@ssh.ffxivteamcraft.com:~/update.ffxivteamcraft.com/
