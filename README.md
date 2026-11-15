# AgroExpress Ltda.

Static, responsive website for Brazilian soybean and corn export inquiries.
Open index.html directly for a local preview. No server or runtime dependencies are required.

## Build and verification

- `npm ci` installs development-only QA tools.
- `npm run build` copies public files to dist. Netlify uses this command.
- `npm test` runs local link, schema, responsive layout, accessibility, navigation, and quote-flow checks. Uses installed Chrome, or Playwright Chromium when CHROME_CHANNEL is set to chromium.
- QA screenshots are saved under qa-output and are not published.

## Quote inquiries

The quote form prepares a reviewable email addressed to sales@agroexpress.farm.
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
Canonical URLs and sitemap entries target https://agroexpress.farm.
Netlify project: https://app.netlify.com/projects/agroexpress-farm
Preview hostname: https://agroexpress-farm.netlify.app
The primary custom domain is agroexpress.farm, with www.agroexpress.farm as an alias.
Namecheap BasicDNS retains control of DNS. The apex A record is 75.2.60.5,
and www is a CNAME to agroexpress-farm.netlify.app.
Publish from the linked checkout with `npx netlify-cli deploy --prod --build`.
GitHub automatic deployment is not configured.
The rebuilt site is maintained at https://github.com/frankbjj23/soybean-site.

## Business email

Namecheap Private Email hosts the intended craig, sales, and steven mailboxes
at agroexpress.farm. Mailbox creation requires the owner to set passwords in
Namecheap; no mailbox credentials are stored in this repository.
Private Email's MX and SPF records are managed by Namecheap's email DNS template.
DKIM uses the subscription's privateemail._domainkey record. The initial DMARC
policy is p=none; enforce quarantine or reject only after checking real mail authentication.
DNS propagation, HTTPS issuance, and actual send/receive delivery must be verified
after the domain and mailboxes become active.
