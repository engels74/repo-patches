---
hide:
  - toc
---

<div class="image-logo"><img src="/img/image-logos/tgraph-bot.svg" alt="logo"></div>

--8<-- "includes/header-links.md"

!!! question "What is this?"

    This is a Docker image for my [tgraph-bot](https://github.com/engels74/tgraph-bot-source). It posts Tautulli graphs to a Discord channel of your choice, with many more features.

## Starting the container

=== "cli"

    ```shell linenums="1"
    docker run --rm \
        --name tgraph-bot \
        -e PUID=1000 \
        -e PGID=1000 \
        -e UMASK=002 \
        -e TZ="Etc/UTC" \
        -v /<host_folder_config>:/config \
        ghcr.io/engels74/tgraph-bot
    ```

=== "compose"

    ```yaml linenums="1"
    services:
      tgraph-bot:
        container_name: tgraph-bot
        image: ghcr.io/engels74/tgraph-bot
        environment:
          - PUID=1000
          - PGID=1000
          - UMASK=002
          - TZ=Etc/UTC
        volumes:
          - /<host_folder_config>:/config
    ```

--8<-- "includes/tags.md"

--8<-- "includes/wireguard.md"