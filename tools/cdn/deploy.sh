#!/usr/bin/env bash
apt-get install rsync

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo VERSION ${PACKAGE_VERSION}

touch ~/.ssh/known_hosts
ssh-keyscan -H ssh.ffxivteamcraft.com >> ~/.ssh/known_hosts

rsync -avz ./dist/apps/client/* dalamud@ssh.ffxivteamcraft.com:~/cdn.ffxivteamcraft.com/${PACKAGE_VERSION}

ssh dalamud@51.83.37.191 << EOF
  cp -rn ./cdn.ffxivteamcraft.com/latest/* ./cdn.ffxivteamcraft.com/${PACKAGE_VERSION}/
  rm ./cdn.ffxivteamcraft.com/latest
  ln -s ./${PACKAGE_VERSION} ./cdn.ffxivteamcraft.com/latest
EOF
