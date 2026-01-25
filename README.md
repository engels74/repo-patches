# repo-patches

GitHub Actions workflows and modular content for syncing engels74's Docker container repositories and documentation website from upstream [hotio](https://github.com/hotio) sources.

## Workflows

| Workflow | Target Repository | Upstream Source | Trigger |
|----------|-------------------|-----------------|---------|
| `base-image.yml` | `engels74/base-image` | `hotio/base` | Manual dispatch |
| `sync-hweb.yml` | `engels74/website` | `hotio/website` | Manual dispatch (with dry-run option) |

Both workflows apply engels74 branding and customizations during sync.

## Content Structure

```
hweb-content/
├── config/
│   └── mkdocs.yml                  # Site configuration (navigation, branding)
├── docs/
│   ├── index.md                    # Homepage
│   ├── faq.md                      # FAQ (redirects to hotio.dev)
│   ├── CNAME                       # Domain: engels74.net
│   ├── overrides/
│   │   └── main.html               # Theme overrides
│   └── containers/                 # Documentation and tag metadata
│       ├── base-image.md / .json
│       ├── caddy.md / .json
│       ├── obzorarr.md / .json
│       ├── overseerr-anime.md / .json
│       ├── qbittorrent.md / .json
│       ├── qflood.md / .json
│       ├── sabnzbd.md / .json
│       └── tgraph-bot.md / .json
└── assets/
    ├── stylesheets/
    │   └── extra-custom.css        # Custom theme styles
    └── img/
        ├── engels74.svg            # Site logo
        └── image-logos/            # Container logos
```

## Containers

| Container | Description |
|-----------|-------------|
| base-image | Alpine-based foundation image with VPN and s6-overlay support |
| caddy | Caddy 2 web server with custom modules |
| obzorarr | Original container (not in upstream) |
| overseerr-anime | Overseerr fork with anime instance support |
| qbittorrent | qBittorrent with libtorrent v2 |
| qflood | qBittorrent with Flood web UI |
| sabnzbd | SABnzbd usenet client |
| tgraph-bot | Original container (not in upstream) |

## Sync Behavior

**Replaced:** MkDocs configuration, homepage, FAQ, all container documentation, CNAME, branding assets

**Preserved from upstream:** VPN include snippets, base stylesheets, JavaScript utilities, affiliate banners, container logos for kept images

**Removed:** Container docs not in the keep list, scripts section, guides section, unused images

## Requirements

**Secret:** `GH_PAT` - Personal Access Token with `repo` scope

## License

AGPL-3.0
