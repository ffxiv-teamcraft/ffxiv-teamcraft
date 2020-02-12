#!/usr/bin/env bash
ssh-keyscan -H ssh.ffxivteamcraft.com >> ~/.ssh/known_hosts

scp -p ./release/squirrel-windows/* dalamud@ssh.ffxivteamcraft.com:~/update.ffxivteamcraft.com/
