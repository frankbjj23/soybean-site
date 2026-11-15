# AgroExpress Ltda.

Static, responsive website for Brazilian soybean and corn export inquiries.
Open index.html directly for a local preview. No server or runtime dependencies are required.

## Build and verification

- `npm ci` installs development-only QA tools.
- `npm run build` copies public files to dist. Netlify uses this command.
- `npm test` runs local link, schema, responsive layout, accessibility, navigation, and quote-flow checks. Uses installed Chrome, or Playwright Chromium when CHROME_CHANNEL is set to chromium.
- QA screenshots are saved under qa-output and are not published.

## Quote inquiries

The quote form prepares a reviewable email addressed to sales@agroexpressltda.com.
The buyer must send it from their email application. Copy and edit actions are also available.
It does not claim a message was sent or store submissions on a server.
Craig and Steven retain direct phone and email links throughout the site.

## Design references

Reviewed November 15, 2026:

- Farm Minerals: Awwwards Site of the Day, February 19, 2026, score 7.42/10.
  https://www.awwwards.com/sites/farm-minerals
- Bunge agriculture: clear commodity and grower-partnership information.
  https://bunge.com/agriculture
- Louis Dreyfus grains and oilseeds: product and supply-chain organization.
  https://www.ldc.com/who-we-are/about-us/our-business-lines/grains-oilseeds/

These informed visual hierarchy and buyer navigation; competitor copy and business claims were not imported.
The original AgroExpress logo, local Raleway fonts, curved-arrow artwork, company facts, and approved contacts are retained.
Image provenance is recorded in assets/README.md.

## Publishing

Netlify configuration publishes dist with clean routes and a real 404 response.
Canonical URLs and sitemap entries target https://www.agroexpressltda.com.
Connecting the production domain to this build is a separate hosting step.
The rebuilt site is maintained at https://github.com/frankbjj23/soybean-site.
