---
hide:
  - toc
---

<div class="image-logo"><img src="/img/image-logos/obzorarr.svg" alt="logo"></div>

--8<-- "includes/header-links.md"

!!! question "What is this?"

    Obzorarr is a "Plex Wrapped" application that syncs viewing history from your Plex Media Server and generates yearly statistics with an animated slideshow presentation - similar to Spotify Wrapped. It doesn't require Tautulli; it only relies on the Plex API.

!!! note "Branches and Tags"

    This project maintains multiple branches, each with its own Docker tag:

    - **`:release` (or `:latest`)**:
      Stable releases built from tagged versions of the [obzorarr](https://github.com/engels74/obzorarr) repository.

    - **`:nightly`**:
      Built from every commit to the main branch, providing the latest development features.

    - **`:pr`**:
      Built from the [`pr`](https://github.com/engels74/obzorarr-docker/tree/pr) branch. This tag is used for testing pull request changes and experimental builds before they are merged into the main codebase.

## Starting the container

=== "cli"

    ```shell linenums="1"
    docker run --rm \
        --name obzorarr \
        -p 3000:3000 \
        -e PUID=1000 \
        -e PGID=1000 \
        -e UMASK=002 \
        -e TZ="Etc/UTC" \
        -v /<host_folder_config>:/config \
        ghcr.io/engels74/obzorarr-docker
    ```

=== "compose"

    ```yaml linenums="1"
    services:
      obzorarr:
        container_name: obzorarr
        image: ghcr.io/engels74/obzorarr-docker
        ports:
          - "3000:3000"
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

