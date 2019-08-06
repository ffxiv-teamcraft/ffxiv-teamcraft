#!/usr/bin/env bash
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo VERSION ${PACKAGE_VERSION}

rsync -avz ./dist/apps/client/* dalamud@cdn.ffxivteamcraft.com:~/cdn.ffxivteamcraft.com/${PACKAGE_VERSION}

ssh dalamud@cdn.ffxivteamcraft.com << EOF
  ln -s ./cdn.ffxivteamcraft.com/${PACKAGE_VERSION} ./cdn.ffxivteamcraft.com/latest
EOF
