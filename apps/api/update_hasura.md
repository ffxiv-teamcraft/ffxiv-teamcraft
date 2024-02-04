To update hasura version in Cloud Run:

```shell
docker pull hasura/graphql-engine
docker tag docker.io/hasura/graphql-engine:latest eu.gcr.io/ffxivteamcraft/hasura
docker push eu.gcr.io/ffxivteamcraft/hasura
```

Then deploy the image again in Cloud Run.
