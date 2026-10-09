# ADVERTA Website — Hostinger Upload Guide

## What's included
- Seven static HTML pages, responsive shared CSS, vanilla JavaScript, PHP form handler.
- SEO metadata, Organization + ProfessionalService JSON-LD, sitemap, robots, and `.htaccess`.
- Client logo tiles and campaign evidence extracted from the supplied ADVERTA Performance Marketing Portfolio PDF.
- Original logo assets are not included in this brief's separate logo source files, so each client logo is currently a clearly marked text-based SVG placeholder.

## Upload to Hostinger
1. In Hostinger hPanel, open **Websites → Manage → File Manager**.
2. Open `public_html`. Back up any existing site files before replacing them.
3. Upload the contents of this folder (not the enclosing `adverta-website` folder) into `public_html`.
4. Keep the `assets` and `php` folders in their exact locations.
5. Confirm the domain points to this hosting account and SSL is active.
6. Visit `https://YOUR-DOMAIN/` and test each navigation link.
7. Submit the audit form after waiting at least 3 seconds. If PHP mail is blocked, use the WhatsApp fallback or configure Hostinger SMTP (recommended).
8. Test on a phone, check image lightboxes, and verify that all forms return a success or error message.
9. After domain confirmation, update the canonical URLs and `sitemap.xml` if your final domain is not `https://adverta.co/`.

## Replace these files
- `assets/img/logo-adverta.svg`: replace only if you have a final approved brand mark.
- `assets/img/logo-*.svg`: replace with the original client logo files. Keep the filenames or update each reference in `index.html`.
- The three Egyptian store sales dashboard screenshots (`results-14days.png`, `results-7days.png`, `results-single-day.png`) were not present as standalone originals in the supplied PDFs. The website therefore displays clear replacement placeholders until you add these exact screenshots. Do not substitute the extracted ad-platform evidence for these store dashboards. Keep the full watermark and date range visible.
- `assets/img/case-*.png`: confirm each image actually corresponds to the named campaign before using it as a specific result.
- Add client testimonials only after receiving approved client name, brand, quote, or video.
- Replace `https://adverta.co/` if the final domain differs.

## Confirm before launch
- Confirm media buying pricing model, minimum monthly ad spend, and minimum commitment.
- Confirm the coaching price range and launch status.
- Confirm case-study starting situations and exact reporting timeframes marked TO CONFIRM.
- Confirm whether the coaching waitlist should use a separate list or CRM.
- Confirm the final privacy policy and cookie/consent approach before adding tracking.
- Add actual GTM, GA4, and Meta Pixel IDs. Implement consent-aware loading before activating tracking.
- Consider configuring authenticated SMTP for reliable email delivery. The included PHP uses PHP `mail()`; Hostinger's mail policy/settings can affect delivery.
- Confirm the site's real domain, canonical URLs, and social preview image.
- Review all numbers and currency units against the source portfolio before publishing.

## Form details and testing
- Audit form posts to `php/send-form.php`, which validates required fields, a honeypot, and a basic time-based check.
- Emails are addressed to `adverta.co11@gmail.com`.
- The script returns JSON. If email sending fails, the page shows an error and users can click **Send via WhatsApp instead**.
- On Hostinger, check PHP is enabled and that `mail()` is allowed. For production reliability, configure SMTP using a reputable provider and update the PHP handler accordingly.
- Test valid submission, missing required fields, invalid phone, selecting `None` with other platforms, and the WhatsApp fallback.
- The waitlist form sends to the same email handler; it does not store contacts in a database.
- The HTML includes a consent checkbox for contact requests, but it is not a substitute for a published privacy policy.

## Notes
- No Node.js, database, package manager, or build process is required.
- Static files should be uploaded directly to `public_html`.
- Do not put secrets or API keys in client-side JavaScript.
