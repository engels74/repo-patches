# engels74-repo-patches

This repository contains GitHub Actions workflows and modular content for syncing and customizing engels74's Docker container repositories and documentation websites from upstream hotio sources.

## Workflows

### `base-image.yml`
Syncs the `engels74/base-image` repository with upstream `hotio/base`, applying branding modifications.

### `sync-hweb.yml`
Syncs the `engels74/hweb` documentation website with upstream `hotio/website`, applying comprehensive customizations including:
- Custom navigation structure
- Container documentation for engels74's forks
- Branding and URL replacements
- Removal of unused content

**Triggers:**
- Manual dispatch (with optional dry-run mode)
- Weekly schedule (Sundays at 00:00 UTC)

## Modular Content Structure

```
hweb-content/
├── config/
│   └── mkdocs.yml          # Custom MkDocs configuration
├── docs/
│   ├── index.md            # Custom homepage
│   ├── faq.md              # FAQ with redirect to hotio.dev
│   ├── CNAME               # Domain configuration
│   └── containers/         # Container documentation
│       ├── base-image.md
│       ├── caddy.md
│       ├── obzorarr.md
│       ├── overseerr-anime.md
│       ├── qbittorrent.md
│       ├── qflood.md
│       ├── sabnzbd.md
│       └── tgraph-bot.md
└── assets/
    └── img/
        ├── engels74.svg    # Custom branding logo
        └── image-logos/    # Container logos
```

---

# Modularization Analysis

## Overview

This document explains what content is modularized in `hweb-content/` and why each decision was made.

## Content Stored in repo-patches (Source of Truth)

### 1. Container Documentation (8 files)

**Location:** `hweb-content/docs/containers/`

| File | Reason for Modularization |
|------|--------------------------|
| `base-image.md` | Custom version with engels74 branding and ghcr.io references |
| `caddy.md` | Custom Caddy 2 configuration with engels74-specific modules |
| `obzorarr.md` | Engels74-unique container (not in hotio upstream) |
| `overseerr-anime.md` | Fork of seerr with anime-specific customizations |
| `qbittorrent.md` | Custom qBittorrent with libtorrent v2 |
| `qflood.md` | Custom qBittorrent+Flood combo (different from hotio/rflood) |
| `sabnzbd.md` | Custom SABnzbd configuration |
| `tgraph-bot.md` | Engels74-unique container (not in hotio upstream) |

**Why modularize?** These files contain:
- `ghcr.io/engels74/` container references instead of `ghcr.io/hotio/`
- Custom descriptions and usage notes
- Engels74-specific configuration examples
- Containers unique to engels74 (obzorarr, tgraph-bot)

### 2. Homepage (`index.md`)

**Location:** `hweb-content/docs/index.md`

**Why modularize?** Contains:
- Custom welcome message explaining this is a fork
- engels74-specific support information
- References to engels74's container selection

### 3. FAQ Page (`faq.md`)

**Location:** `hweb-content/docs/faq.md`

**Why modularize?** Implements:
- JavaScript confirmation dialog before redirecting to hotio.dev/faq
- Fallback content for users with JavaScript disabled
- Explanation of why redirect is used

### 4. MkDocs Configuration (`mkdocs.yml`)

**Location:** `hweb-content/config/mkdocs.yml`

**Why modularize?** Contains:
- `site_name: engels74.net` (not `hotio.dev`)
- `site_url: https://engels74.net`
- `repo_url: https://github.com/engels74`
- Custom navigation with only 8 containers
- No Scripts section
- No Guides section
- Logo reference to `img/engels74.svg`

### 5. Domain Configuration (`CNAME`)

**Location:** `hweb-content/docs/CNAME`

**Why modularize?** Contains `engels74.net` for GitHub Pages domain routing.

### 6. Branding Logo (`engels74.svg`)

**Location:** `hweb-content/assets/img/engels74.svg`

**Why modularize?** Custom branding logo that replaces `hotio.svg` in the site header.

---

## Content NOT Modularized (Synced from Upstream)

### 1. Include Snippets (`includes/`)

| File | Reason to Keep Upstream |
|------|------------------------|
| `annotations.md` | VPN environment variable annotations - generic, works for all containers |
| `header-links.md` | Template for GitHub/ghcr.io links - works with any org name |
| `tags.md` | Dynamic tags table template - fetches from respective repos |
| `wireguard.md` | VPN configuration examples - generic across all containers |

**Why not modularize?** These snippets use `--8<--` syntax and work identically for both hotio and engels74 containers. The `header-links.md` dynamically generates links based on the container name in the H1 heading.

### 2. Stylesheets (`docs/stylesheets/extra.css`)

**Why not modularize?** The "hotio" color scheme is shared. Engels74 uses the same dark theme with orange accents.

### 3. JavaScript (`docs/javascripts/loadJSON.js`)

**Why not modularize?** The script dynamically loads `tags.json` and `links.json` from the respective container repositories. It works with any GitHub organization because it parses the container name from the page.

### 4. Theme Overrides (`docs/overrides/main.html`)

**Why not modularize?** Contains only theme color and font imports, which are identical for both sites.

### 5. VPN Banner Images

**Why not modularize?** Affiliate banners for ProtonVPN and PIA are shared with hotio. Same affiliate links benefit both.

---

## Workflow Behavior

### What Gets Deleted During Sync

1. **Container Docs** not in the keep list:
   - Uses inverse logic: only 8 containers are kept (base-image, caddy, obzorarr, overseerr-anime, qbittorrent, qflood, sabnzbd, tgraph-bot)
   - All other container docs from upstream are automatically deleted
   - This handles hotio adding/removing containers without workflow changes

2. **Scripts Folder** (`docs/scripts/`):
   - sysinfo.md, pullio.md, arr-discord-notifier.md

3. **Guides Folder** (`docs/guides/`):
   - torguard.md (and any other guides)

4. **Unused Images**:
   - Pullio mascot images (17 files)
   - Script screenshots
   - Unused container logos (for containers not in engels74's list)
   - Unused webhook avatars

### What Gets Replaced

1. `mkdocs.yml` - Complete replacement with custom navigation
2. `docs/index.md` - Custom homepage
3. `docs/faq.md` - Custom FAQ with redirect
4. `docs/containers/*.md` - All 8 container docs
5. `docs/CNAME` - Domain configuration
6. `docs/img/engels74.svg` - Custom logo

### What Gets Preserved from Upstream

1. `includes/*.md` - All include snippets
2. `docs/stylesheets/extra.css` - Theme styles
3. `docs/javascripts/loadJSON.js` - Dynamic content loader
4. `docs/overrides/main.html` - Theme overrides
5. VPN affiliate banners
6. Favicon
7. Core image logos for kept containers

---

## Error Handling

The workflow implements fail-fast behavior:

1. **Pre-flight Check**: Verifies all required source files exist before any modifications
2. **Explicit File Checks**: Each file operation verifies success
3. **Post-modification Verification**: Confirms final structure before commit
4. **Dry-run Mode**: Test changes without pushing

---

## Secrets Required

- `GH_PAT`: Personal Access Token with `repo` scope for pushing to `engels74/hweb`
