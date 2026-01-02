---
hide:
  - toc
---

<div class="image-logo"><img src="/img/image-logos/caddy.svg" alt="logo"></div>

--8<-- "includes/header-links.md"

!!! question "What is this?"

    A Docker image with [Caddy 2](https://caddyserver.com){: target=_blank rel="noopener" } including DNS modules for [Cloudflare](https://github.com/caddy-dns/cloudflare){: target=_blank rel="noopener" }, [Njalla](https://github.com/caddy-dns/njalla){: target=_blank rel="noopener" }, and [rate limiting](https://github.com/mholt/caddy-ratelimit){: target=_blank rel="noopener" }. The default configuration restricts access to private IP ranges only.

## Starting the container

=== "cli"

    ```shell linenums="1"
    docker run --rm \
        --name caddy \
        -p 80:8080 \
        -p 443:8443 \
        -e PUID=1000 \
        -e PGID=1000 \
        -e UMASK=002 \
        -e TZ="Etc/UTC" \
        -e CUSTOM_BUILD="" \
        -v /<host_folder_config>:/config \
        ghcr.io/engels74/caddy
    ```

=== "compose"

    ```yaml linenums="1"
    services:
      caddy:
        container_name: caddy
        image: ghcr.io/engels74/caddy
        ports:
          - "80:8080"
          - "443:8443"
        environment:
          - PUID=1000
          - PGID=1000
          - UMASK=002
          - TZ=Etc/UTC
          - CUSTOM_BUILD
        volumes:
          - /<host_folder_config>:/config
    ```

--8<-- "includes/tags.md"

## Custom build

If you set the environment variable `CUSTOM_BUILD` to a file location like for example `/config/caddy_linux_amd64_custom`, an attempt is made to start Caddy with that binary. The custom build can be obtained from the Caddy [download](https://caddyserver.com/download){: target=\_blank rel="noopener" } page. This is particularly useful if you need extra modules.

--8<-- "includes/wireguard.md"
