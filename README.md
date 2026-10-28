# Genspark website starter

This folder contains the complete five-page customer-facing website, including the official logo and all styles and scripts. It is a static site: no npm install, build step, API keys, or database required.

## Preview your copy

1. Unzip the archive.
2. Open a terminal in the `genspark-website-starter` folder.
3. Run `python3 -m http.server 8000` (on Windows, try `py -m http.server 8000`).
4. Open http://localhost:8000 in your browser.
5. Press Ctrl+C in the terminal when finished.

You can also open `index.html` directly in a browser. A local server is recommended for checking the complete site. Google Fonts requires an internet connection; local fallback fonts are provided.

## Make it yours

- `index.html`: the home page, AI for business.
- `business.html`: the same business page, linked from the navigation. Apply business-page edits to BOTH `index.html` and `business.html` so they stay in sync.
- `business.css`: business page layout and styling.
- `data.js`: shared copy, categories, example workflows, and tool lists for the Interactive map and At a glance pages.
- `interactive-map.html` and `app.js`: interactive map shell and detail-panel labels.
- `at-a-glance.html`: at-a-glance layout and labels.
- `how-it-works.html` and `how-it-works.css`: request-to-answer diagram and copy.
- `collaboration.html` and `collaboration.css`: the four stages of agent collaboration.
- `styles.css`: shared colors, typography, and map styling.
- `page-nav.css`: navigation styling. Navigation links are written in each HTML page, so update every page when adding or renaming a page.
- `logos/genspark.svg`: official Genspark logo. Preserve its proportions.
- `logos/gamma.png`, `icons.js`, `orbit.js`, and `how-it-works.js`: supporting visual assets and behavior.

### Personalize the contact section

The template currently contains Diego Villa's details. In BOTH `index.html` and `business.html`, replace:

- Name, role, and initials (`DV`).
- Email text and its `mailto:` link.
- Phone text and its `tel:` and `sms:` links.
- Calendar URL in the “Grab a time on my calendar” button.

Business statistics and product descriptions are copied from the supplied business overview. Update these as the product and approved messaging change.

## Publish your own site with GitHub Pages

1. Create your own GitHub repository.
2. Upload the CONTENTS of this folder to the repository root, with `index.html` at the root.
3. Include `.nojekyll`, an empty file that tells GitHub Pages to serve the files directly.
4. In Settings → Pages, choose “Deploy from a branch”, then `main` and `/ (root)`.
5. Save and wait for the deployment to finish. GitHub will show your website URL.

GitHub Pages availability for private repositories depends on your GitHub plan. A Pages site can be public even when the repository is private.

Other static hosting services also work: upload this folder as the site root with no build command.

## Quick review before sharing

- Open all five pages and follow the navigation links.
- Check the Interactive map detail panels and the diagram controls.
- Check the page on a phone-sized screen.
- Confirm your calendar, email, call, and text links.
- Confirm `index.html` and `business.html` contain the same business content.

This archive is an independent copy. Editing it does not change the original published website. Git history, credentials, local preview tools, and the source PDF are not included.
