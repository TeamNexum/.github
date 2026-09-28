# TeamNexum/.github

Organization-wide files for [TeamNexum](https://github.com/TeamNexum).

- `profile/README.md`: the text shown at the top of the organization page.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`: defaults for every TeamNexum repository that doesn't have its own. The main [Nexum](https://github.com/TeamNexum/Nexum) repo keeps its own versions, with the Rust and Tauri checks.

`assets/` holds the images used by the profile: the banners (dark and light, rebuilt from `assets/src/banner.html` with headless Chrome) and the app demo GIF (recorded with `assets/src/record-app.mjs` against the desktop app's Vite preview, with a mocked backend).
