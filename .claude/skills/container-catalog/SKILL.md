---
name: container-catalog
description: Keep the website sync's duplicated container catalog consistent when adding or removing a container.
---

# Change the website container catalog

Use this workflow only when adding or removing a container from the engels74 website.

1. Add or remove `hweb-content/docs/containers/<name>.md`. Keep its tag table as pre-rendered
   HTML; the sync does not generate that table from a checked-in JSON file.
2. Update both user-facing indexes:
   - `hweb-content/config/mkdocs.yml` under `nav`
   - `hweb-content/docs/index.md` if the container should appear in the homepage pills
3. Update every applicable catalog in `.github/workflows/sync-hweb.yml`:
   - `REQUIRED_FILES`
   - `CONTAINERS_TO_KEEP`
   - `TAGS_JSON_TO_KEEP`
   - `CONTAINERS`
   - `KEEP_LOGOS`
   - `KEEP_AVATARS` when the inherited upstream avatar is needed
   - `EXPECTED_FILES`
   - remove the name from `UNWANTED_CONTAINERS` or `UNWANTED_TAGS` if it is a listed spot check
4. Put a custom logo under `hweb-content/assets/img/image-logos/` only when upstream does not
   supply it. The workflow copies this directory before applying `KEEP_LOGOS`.
5. Do not treat `hweb-content/docs/containers/<name>-tags.json` as deployment input. The sync
   restores the target's existing base-image JSON and writes `{}` for every other container.
6. Dispatch the non-pushing integration path and inspect the workflow's final-structure check:

   ```bash
   gh workflow run sync-hweb.yml --repo engels74/repo-patches -f dry_run=true
   ```
