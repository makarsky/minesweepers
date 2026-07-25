#!/usr/bin/env python3
"""Generate PWA icons from icon.html and replace files under app-icons/.

Renders the <main> board at each target size via headless Chrome (Playwright),
then writes the PNGs referenced by manifest.webmanifest and index.html.

Usage:
  python3 scripts/generate-icons.py

Optional:
  python3 scripts/generate-icons.py --install-deps
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ICON_HTML = ROOT / "icon.html"
ICONS_DIR = ROOT / "app-icons"
VENV_DIR = ROOT / ".venv-icons"

# (filename, size_px, content_ratio)
# content_ratio < 1 leaves a safe margin (maskable icons use ~0.8).
ICON_TARGETS = (
    ("icon-192.png", 192, 1.0),
    ("icon-512.png", 512, 1.0),
    ("icon-192-maskable.png", 192, 0.8),
    ("icon-512-maskable.png", 512, 0.8),
    ("apple-touch-icon.png", 180, 1.0),
    ("favicon-32.png", 32, 1.0),
)


def ensure_venv_and_playwright() -> Path:
    python = VENV_DIR / "bin" / "python"
    if not python.exists():
        print(f"Creating venv at {VENV_DIR} ...", flush=True)
        venv.create(VENV_DIR, with_pip=True)

    subprocess.check_call(
        [str(python), "-m", "pip", "install", "--upgrade", "pip"],
        cwd=ROOT,
    )
    subprocess.check_call(
        [str(python), "-m", "pip", "install", "playwright"],
        cwd=ROOT,
    )
    return python


def generate_icons() -> None:
    from playwright.sync_api import sync_playwright

    if not ICON_HTML.is_file():
        raise SystemExit(f"Missing source page: {ICON_HTML}")

    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    icon_url = ICON_HTML.resolve().as_uri()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        try:
            for filename, size, content_ratio in ICON_TARGETS:
                page = browser.new_page(
                    viewport={"width": size, "height": size},
                    device_scale_factor=1,
                )
                url = f"{icon_url}?size={size}&contentRatio={content_ratio}"
                page.goto(url, wait_until="networkidle")
                page.evaluate("() => document.fonts.ready")
                # Extra paint settle for web fonts / layout
                page.wait_for_timeout(200)

                out_path = ICONS_DIR / filename
                page.locator("body").screenshot(
                    path=str(out_path),
                    type="png",
                    omit_background=True,
                )
                page.close()
                print(
                    f"Wrote {out_path.relative_to(ROOT)} ({size}x{size}, ratio={content_ratio})",
                    flush=True,
                )
        finally:
            browser.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Minesweeper PWA icons from icon.html")
    parser.add_argument(
        "--install-deps",
        action="store_true",
        help="Create .venv-icons and install Playwright before generating",
    )
    args = parser.parse_args()

    venv_python = VENV_DIR / "bin" / "python"
    in_venv = Path(sys.prefix).resolve() == VENV_DIR.resolve()

    if args.install_deps or not in_venv:
        python = ensure_venv_and_playwright()
        if Path(sys.executable).resolve() != python.resolve():
            cmd = [
                str(python),
                str(Path(__file__).resolve()),
                *[arg for arg in sys.argv[1:] if arg != "--install-deps"],
            ]
            return subprocess.call(cmd, cwd=ROOT)

    try:
        import playwright  # noqa: F401
    except ImportError:
        ensure_venv_and_playwright()
        cmd = [str(venv_python), str(Path(__file__).resolve())]
        return subprocess.call(cmd, cwd=ROOT)

    try:
        generate_icons()
    except Exception as error:
        message = str(error)
        if "Executable doesn't exist" in message or "chrome" in message.lower():
            print(
                "Playwright could not launch Chrome.\n"
                "Install Google Chrome, or run: "
                f"{venv_python} -m playwright install chromium\n"
                "then edit this script to launch without channel='chrome'.",
                file=sys.stderr,
            )
        raise

    return 0


if __name__ == "__main__":
    sys.exit(main())
