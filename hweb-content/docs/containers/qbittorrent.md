---
hide:
  - toc
---

<div class="image-logo"><img src="/img/image-logos/qbittorrent.svg" alt="logo"></div>

--8<-- "includes/header-links.md"

!!! question "What is this?"

    This is a fork of Hotio's [qBittorrent](https://hotio.dev/containers/qbittorrent) Docker image, that uses [libtorrent v2.x](https://github.com/userdocs/qbittorrent-nox-static/releases) by default.
    
    Hotio [recently]() added the option to define by ENV if you want to use libtorrent v1 or v2. This one uses `v2` by default.
    
    This also still includes VueTorrent in the image.

## Starting the container

=== "cli"

    ```shell linenums="1"
    docker run --rm \
        --name qbittorrent \
        -p 8080:8080 \
        -e PUID=1000 \
        -e PGID=1000 \
        -e UMASK=002 \
        -e TZ="Etc/UTC" \
        -e WEBUI_PORTS="8080/tcp,8080/udp" \
        -e LIBTORRENT="v2" \
        -v /<host_folder_config>:/config \
        -v /<host_folder_data>:/data \
        ghcr.io/engels74/qbittorrent
    ```

=== "compose"

    ```yaml linenums="1"
    services:
      qbittorrent:
        container_name: qbittorrent
        image: ghcr.io/engels74/qbittorrent
        ports:
          - "8080:8080"
        environment:
          - PUID=1000
          - PGID=1000
          - UMASK=002
          - TZ=Etc/UTC
          - WEBUI_PORTS=8080/tcp,8080/udp
          - LIBTORRENT=v2
        volumes:
          - /<host_folder_config>:/config
          - /<host_folder_data>:/data
    ```

--8<-- "includes/tags.md"

## Alternative Web UI

This image comes bundled with the alternative Web UI [VueTorrent](https://github.com/VueTorrent/VueTorrent) (`/app/vuetorrent`). Nightwalker is removed, as it is no longer maintained.

--8<-- "includes/wireguard.md"