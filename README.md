# Minesweeper

Classic Minesweeper as a Progressive Web App (PWA).

## Git hooks (service worker assets)

`sw.js` keeps a precache `ASSETS` list and a `CACHE_NAME` tied to the current
git `HEAD` short hash. Both are generated so new static files are not forgotten
and caches bust when you commit.

### One-time setup (each clone)

Point git at the versioned hooks directory:

```bash
git config core.hooksPath hooks
```

This is local to your clone (not committed). Confirm:

```bash
git config core.hooksPath
# hooks
```

### What the pre-commit hook does

On every commit, `hooks/pre-commit`:

1. Runs `scripts/sync-sw-assets.sh --write`
2. Sets `CACHE_NAME` to `minesweeper-<short-HEAD>` (`HEAD` at hook time is the
   parent of the commit being created)
3. Rebuilds `ASSETS` from `index.html`, `style.css`, `main.js`,
   `manifest.webmanifest`, every file in `app-icons/`, and every file in `assets/`
4. Stages `sw.js` so the commit includes the updated file

### Manual commands

```bash
# Regenerate sw.js now
./scripts/sync-sw-assets.sh --write

# Verify ASSETS matches files on disk (does not require CACHE_NAME == HEAD)
./scripts/sync-sw-assets.sh --check
```

## Icon generation

1. Update `icon.html`
2. Preview any size in a browser: `icon.html?size=512` or `icon.html?size=512&contentRatio=0.8`
3. Run `python3 scripts/generate-icons.py`
4. Commit — the pre-commit hook will pick up new files under `app-icons/`
