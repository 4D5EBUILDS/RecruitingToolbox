# RecruitingToolbox

Static toolbox of recruiting/medical utilities, published via GitHub Pages
at **https://4d5ebuilds.github.io/RecruitingToolbox/**.

## Layout

| Path | What's there |
|------|--------------|
| `index.html` | Homepage / tool grid (the links that open each tool) |
| `recruiting-tools/` | The actual recruiting tools the homepage links to (AIE PDF Converter, Packet QC, ASVAB tool, recruiting map, etc.) |
| `medical-tools/` | Medical DQ & waiver reference tools |
| `army-calculators/` | Calculators |
| `email-templates/` | Word (.docx) email templates — stored for download/reference, not linked from any page |
| `assets/`, `fonts/`, `components/` | Shared styling, fonts, shared UI |
| `uploads/` | Source PDFs/images used to build tools |
| `docs/` | Internal specs/plans |

**Important:** the tools the site actually serves live under `recruiting-tools/`,
not the repo root. When updating a tool, edit the copy under `recruiting-tools/`
(that's what `index.html` links to). Don't keep duplicate copies at the root.

## Saving & publishing changes

This repo is sometimes edited both locally and via GitHub's web uploader, which
causes `git push` to be rejected with "fetch first". To avoid that, **always
pull before you push.** The easiest way:

```bash
./sync.sh "what you changed"
```

That stages everything, commits, pulls (rebasing your work on top of GitHub's),
and pushes — in the right order, every time. After it finishes, GitHub Pages
redeploys in ~1–2 minutes.

If you prefer doing it by hand:

```bash
git add -A
git commit -m "what you changed"
git pull --rebase origin main
git push origin main
```

`git config pull.rebase true` is already set for this repo, so a plain
`git pull` will also rebase instead of creating merge commits.
