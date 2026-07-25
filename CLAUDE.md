# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Repository role

This repository is a patch payload and workflow controller, not the built website or container
source. `.github/workflows/sync-hweb.yml` hard-resets `engels74/website` to `hotio/website`,
copies selected `hweb-content/` files into it, then force-pushes `master` unless `dry_run` is
true. `.github/workflows/base-image.yml` similarly resets and force-pushes the `workflows`,
`alpinevpn`, and `noblevpn` branches of `engels74/base-image`.

Make durable website customizations here, not directly in `engels74/website`; make durable
base-image sync customizations in `.github/workflows/base-image.yml`, not in the reset target.

## Non-obvious invariants

- `hweb-content/config/mkdocs.yml` becomes target-root `mkdocs.yml`;
  `hweb-content/docs/overrides/main.html` becomes target-root `overrides/main.html`. Other patch
  paths are also explicit in `.github/workflows/sync-hweb.yml`; do not infer them from this
  repository's layout.
- Container tag tables are pre-rendered HTML inside each container Markdown file. The checked-in
  `hweb-content/docs/containers/*-tags.json` files are not copied by the sync. The target's
  existing `base-image-tags.json` is preserved; every other target tag JSON is replaced with
  `{}` for downstream image builds to populate.
- Container membership is duplicated across workflow validation, deletion, copy, cleanup, and
  final verification lists. Use the `container-catalog` skill rather than updating only the
  navigation or Markdown.
- Container docs depend on `includes/wireguard.md`, and MkDocs depends on upstream JavaScript and
  CSS retained after reset. This checkout is therefore not a standalone website source tree.
- Cross-repository checkouts and pushes require the `GH_PAT` secret. The watcher uses the
  repository `GITHUB_TOKEN` only to inspect upstream and dispatch `base-image.yml`.

## Commands

There is no local build, test, lint, or typecheck task configured in this repository. Exercise
the website sync without pushing its target branch with:

```bash
gh workflow run sync-hweb.yml --repo engels74/repo-patches -f dry_run=true
```

## Reference rules

- `.claude/skills/container-catalog/SKILL.md` — coordinated container add/remove procedure.
  Read before changing which containers appear on the website.
- `.github/workflows/sync-hweb.yml` — authoritative website source-to-target mapping and cleanup
  contract. Read before changing `hweb-content/` structure or sync behavior.
- `.github/workflows/base-image.yml` and `.github/workflows/watch-hotio-base.yml` — destructive
  base-image sync and its non-bot-commit dispatch gate. Read before changing image sync behavior.
