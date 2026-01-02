---
hide:
  - toc
---

<div class="image-logo"><img src="https://i.imgur.com/BcvImhI.png" alt="logo"></div>

--8<-- "includes/header-links.md"

!!! question "What is this?"

    This is a fork of Hotio's [overseerr](https://hotio.dev/containers/overseerr) Docker image, that includes the [Anime Instance PR (#3664)](https://github.com/sct/overseerr/pull/3664).

    It's built using [this fork of the PR](https://github.com/engels74/overseerr-anime-source).

!!! note "Branches and Tags"

    This project maintains two branches, each with its own Docker tag:

    - **`:release` (or `:latest`)**:
      Based on the [`feature-default-anime-instance-checkbox-release`](https://github.com/engels74/overseerr-anime-source/tree/feature-default-anime-instance-checkbox-release) branch.
      This is the stable version, rebased from the `sct/overseerr` repository's `master` branch (official releases) with the anime instance support changes applied.

???+ info "Why is this needed?"

    This was made since Overseerr maintainers are [very busy](https://discord.com/channels/783137440809746482/785475251231784961/1262212831579996285), and it probably won't get merged in the near future.

## Starting the container

=== "cli"

    ```shell linenums="1"
    docker run --rm \
        --name overseerr-anime \
        -p 5055:5055 \
        -e PUID=1000 \
        -e PGID=1000 \
        -e UMASK=002 \
        -e TZ="Etc/UTC" \
        -e WEBUI_PORTS="5055/tcp,5055/udp" \
        -v /<host_folder_config>:/config \
        ghcr.io/engels74/overseerr-anime
    ```

=== "compose"

    ```yaml linenums="1"
    services:
      overseerr-anime:
        container_name: overseerr-anime
        image: ghcr.io/engels74/overseerr-anime
        ports:
          - "5055:5055"
        environment:
          - PUID=1000
          - PGID=1000
          - UMASK=002
          - TZ=Etc/UTC
          - WEBUI_PORTS=5055/tcp,5055/udp
        volumes:
          - /<host_folder_config>:/config
    ```

--8<-- "includes/tags.md"

--8<-- "includes/wireguard.md"
