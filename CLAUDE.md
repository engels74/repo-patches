# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository (`repo-patches`) contains GitHub Actions workflows and customization content for syncing engels74's Docker container repositories and documentation website from upstream [hotio](https://github.com/hotio) sources.

**Purpose:** Maintain branded forks of hotio Docker images and documentation while staying in sync with upstream changes.

## Workflows

### base-image.yml
Syncs `engels74/base-image` from `hotio/base`. Processes branches `alpinevpn` and `noblevpn`:
1. Hard resets to upstream
2. Patches CI workflow to use engels74's build workflow
3. Patches s6 init script with engels74 branding (figlet, URLs)
4. Overwrites README.md

**Trigger:** Manual dispatch only

### sync-hweb.yml
Syncs `engels74/website` from `hotio/website`:
1. Hard resets to upstream
2. Deletes unwanted container docs (keeps only 8 containers)
3. Removes scripts and guides sections
4. Copies custom mkdocs.yml, homepage, FAQ, and container docs from `hweb-content/`
5. Copies custom assets (logo, stylesheets)
6. Cleans up unused images

**Trigger:** Manual dispatch (supports dry-run mode)

## Content Structure

```
hweb-content/
├── config/mkdocs.yml           # Full site configuration
├── docs/
│   ├── index.md                # Homepage
│   ├── faq.md                  # Redirects to hotio.dev
│   ├── CNAME                   # engels74.net
│   ├── overrides/main.html     # Theme overrides
│   └── containers/             # 8 container docs + tags JSON
└── assets/
    ├── stylesheets/extra-custom.css
    └── img/engels74.svg
```

## Containers Kept

base-image, caddy, obzorarr, overseerr-anime, qbittorrent, qflood, sabnzbd, tgraph-bot

## Adding a New Container

1. Create `hweb-content/docs/containers/{name}.md` with pre-rendered tag table
2. Add to `CONTAINERS_TO_KEEP` and `TAGS_JSON_TO_KEEP` arrays in sync-hweb.yml
3. Add to `REQUIRED_FILES` verification array
4. Add to `CONTAINERS` copy array
5. Add logo to `KEEP_LOGOS` if needed
6. Add to mkdocs.yml navigation

## Requirements

**Secret:** `GH_PAT` - Personal Access Token with `repo` scope for cross-repository operations.
