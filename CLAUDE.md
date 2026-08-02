# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

`repo-patches` is a **control repository**. It contains no application code, no package manifest, and no local build, test, or lint tooling. It holds:

1. GitHub Actions workflows that rewrite **other** repositories (`engels74/base-image`, `engels74/website`).
2. `hweb-content/` — the canonical source of engels74's customizations for the documentation site, copied into `engels74/website` during sync.

Nothing here runs locally. All effects happen inside Actions runs against remote repos. Never look for `npm test` or an equivalent — there isn't one.

## Essential Commands

Requires the `gh` CLI authenticated against `engels74/repo-patches`. All three workflows are `workflow_dispatch`.

```bash
# Preview a website sync without pushing to engels74/website (strongly preferred first step)
gh workflow run sync-hweb.yml -f dry_run=true

# Real website sync — force-pushes engels74/website@master
gh workflow run sync-hweb.yml

# Sync engels74/base-image from hotio/base (workflows, alpinevpn, noblevpn branches)
gh workflow run base-image.yml

# Force the upstream watcher to evaluate now instead of waiting for its 6-hourly cron
gh workflow run watch-hotio-base.yml
```

`dry_run` exists only on `sync-hweb.yml`. `base-image.yml` has no dry-run mode and force-pushes three branches, so review its diff logic before dispatching.

## Architecture Overview

Three workflows in `.github/workflows/`, each targeting a different repository:

| Workflow | Target | Upstream | Trigger |
|---|---|---|---|
| `sync-hweb.yml` | `engels74/website@master` | `hotio/website@master` | manual, optional dry run |
| `base-image.yml` | `engels74/base-image` (`workflows`, `alpinevpn`, `noblevpn`) | `hotio/base` | manual |
| `watch-hotio-base.yml` | dispatches `base-image.yml` | reads `hotio/base` | cron `37 */6 * * *` + manual |

Both sync workflows follow the same destructive model: **hard reset the target to upstream, delete unwanted upstream content, overlay engels74 content, force-push**. The target repos are outputs, never inputs.

`watch-hotio-base.yml` decides whether a base-image sync is needed by comparing `.parents[0].sha` of `engels74/base-image@<branch>` (which records the last-synced upstream SHA) against `hotio/base@<branch>` HEAD, then counting commits not authored by `github-actions[bot]`. Bot-only upstream churn is skipped because `alpinevpn`/`noblevpn` self-update via `call-update.yml`. Compare failures fail *open* (sync anyway).

`base-image.yml` ends by pushing an empty `chore: Trigger downstream workflows [skip ci]` commit to this repo. Most of this repo's history is that bot commit — ignore it when reading `git log`.

`sync-hweb.yml` is a 19-step linear pipeline with two fail-fast guards worth knowing: step 6 verifies every required source file exists under `patches/hweb-content/`, and step 16 verifies the assembled target tree (expected files present, `docs/scripts`/`docs/guides` gone, unwanted container docs gone). Adding content without updating both guards produces a silently incomplete site or a hard failure.

## Project Boundaries

- `hweb-content/` — edit here. This is the only content source of truth for the docs site.
- `hweb-content/config/mkdocs.yml` — lands at the **target repo root**, not inside `docs/`.
- `hweb-content/assets/` — flattens into `docs/img/`, `docs/img/image-logos/`, and `docs/stylesheets/` in the target.
- `hweb-content/docs/containers/*-tags.json` — **not deployed**; see Critical Gotchas.
- Anything referenced by the site but absent here (`includes/wireguard.md`, `docs/javascripts/tablesort.js`, `docs/javascripts/tagcopy.js`, `docs/stylesheets/extra-13.css`) is deliberately inherited from upstream `hotio/website` after the reset. Do not vendor copies into this repo.

## Common Change Workflows

### Editing existing site content

Edit the file under `hweb-content/`, commit, then run `sync-hweb.yml`. The change is live only after the sync workflow force-pushes the target.

### Adding or removing a container

A container is not defined in one place. Adding one requires all of these, or the sync fails at step 6 or 16, or the page 404s:

1. `hweb-content/docs/containers/<name>.md` — the page.
2. `hweb-content/assets/img/image-logos/<name>.svg` — the logo.
3. `hweb-content/config/mkdocs.yml` — add to `nav:` under the right group (Base Images / Apps / engels74).
4. `hweb-content/docs/index.md` — add a pill link in the matching `e74-registry-category` block.
5. `.github/workflows/sync-hweb.yml` — add the entry to **all five** lists: `REQUIRED_FILES`, `CONTAINERS_TO_KEEP` (`<name>.md`), `TAGS_JSON_TO_KEEP` (`<name>-tags.json`), the `CONTAINERS` copy array, and `KEEP_LOGOS` (both `.svg` and `.png` names). Add `EXPECTED_FILES` entries for `docs/containers/<name>.md` and `docs/containers/<name>-tags.json`.
6. Verify with `gh workflow run sync-hweb.yml -f dry_run=true` before a real sync.

Removing a container is the same five workflow lists in reverse — leaving a name in `CONTAINERS_TO_KEEP` while deleting its `.md` fails step 6.

`KEEP_LOGOS` and `KEEP_AVATARS` are keyed by **upstream asset filename**, which does not always match the doc name: `overseerr-anime.md` is served by upstream's `overseerr.*` assets, and `qflood` needs `flood.*` retained.

## Repository Conventions

- Container pages share a fixed skeleton: YAML front matter (`hide: [toc]`, `title: engels74/<name>`), header link row, `<div class="image-logo">`, a `!!! question "What is this?"` admonition, a hand-written `<div id="tags-table">` block, a `## Starting the container` section with `=== "cli"` / `=== "compose"` tabs, and a trailing `--8<-- "includes/wireguard.md"`. Copy the closest existing page rather than composing one from scratch.
- Tag-table element IDs use a per-container thousand block, assigned in alphabetical container order: base-image `1xxx`, caddy `2xxx`, obzorarr `3xxx`, overseerr-anime `4xxx`, qbittorrent `5xxx`, qflood `6xxx`, sabnzbd `7xxx`, tgraph-bot `8xxx`. A new container takes `9xxx`. IDs must be globally unique across the site because `CopyToClipboard('tagNNNN')` resolves them by DOM id.
- Custom CSS classes are namespaced `e74-*` in `hweb-content/assets/stylesheets/extra-custom.css`. Add new site-specific styles there under that prefix; `extra-13.css` is upstream's and is not present in this repo.
- Commit messages follow Conventional Commits (`docs:`, `fix(sync):`, `chore(renovate):`, `revert:`).
- Renovate is configured in `renovate.json` with `group:allNonMajor` and ignores the `github-actions[bot]` / `engels74-bot` authors, so bot-generated sync commits never trigger rebases.

## Critical Gotchas

**Never edit `engels74/website` or `engels74/base-image` directly.** Both sync workflows `git checkout -B <branch> upstream/<branch>` and then `git push --force`. Any change made in a target repo is destroyed on the next run. Make the change in `hweb-content/` (site) or in the `sed` patch block of `base-image.yml` (image branding) instead.

**`hweb-content/docs/containers/*-tags.json` are never copied to the target.** `sync-hweb.yml` writes `echo '{}'` for seven containers and restores `base-image-tags.json` from a backup taken off the *live target repo* before the reset (step 4.5), because base-image tag data is the root dependency for downstream builds. The JSON files checked in here are reference material only — editing them has no effect on the published site. Tag tables are rendered from the hand-written HTML inside each `<div id="tags-table">`, so tag changes go in the `.md` file.

**The site cannot be previewed from this repository.** `mkdocs.yml` assumes it sits at a repo root beside `docs/`, and the build needs upstream-only files (`includes/`, `docs/javascripts/`, `extra-13.css`). To validate rendering, run `sync-hweb.yml -f dry_run=true` and read the step 16 verification output and diff summary.

**`base-image.yml` branding patches are branch-conditional.** The `init-setup` and README rewrites are skipped on the `workflows` branch and applied only to `alpinevpn` and `noblevpn`; the `call-build.yml` / `call-update.yml` repointing runs on all three. Preserve that split when editing the patch block.

**`GH_PAT` (repo scope) is required** by `sync-hweb.yml` and `base-image.yml` to check out and push to the target repos; `watch-hotio-base.yml` uses the default `GITHUB_TOKEN` with `actions: write`. A workflow failing at checkout usually means the PAT expired, not a logic bug.

## Additional Documentation

- `README.md` — read for the container inventory and the summary of what each sync preserves, replaces, and removes; useful as a quick cross-check when editing the keep/delete lists in `sync-hweb.yml`.
