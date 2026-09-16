# Debenhams gift card email — redesign

Redesign of the transactional "You've been sent a gift card!" email (sender `giftcard@orders.emaildebenhams.com`, Mailgun, template "GIFT CARD SEND V2"). Covers both scenarios the one template serves today: **refund to gift card** and **gift card sent by someone**.

**Live preview:** https://jakerayner96.github.io/debenhams-giftcard-email/ · **Template:** [`template/giftcard.html`](template/giftcard.html)

## What's here

| Path | What |
|---|---|
| `index.html` | Preview shell — New vs Original, Refund vs Gift, 375 / 600 / 760, editable merge fields, copy rendered HTML. Serve over HTTP (`python3 -m http.server 3000`). |
| `template/giftcard.html` | The email. Table layout, inline styles, 600px, MSO guards, Mailgun handlebars merge fields (`{{amount}}`, `{{#if is_refund}}…{{else}}…{{/if}}`). |
| `assets/logos/` | 2× PNGs rendered from the design-system brand SVGs (`debenhamsgroup.design/assets/brands`). Fascia strip logos are pre-tinted Grey 5 `#6B6B6B`. Referenced by absolute Pages URL in the template. |
| `original/giftcard-original.html` | The Nov 2025 production email, extracted from the `.eml`, card number / PIN / recipient redacted, Outlook safelinks unwrapped. Images still load from the live CDN. |

## Design decisions

- **Debenhams mode of the group design system**, hard-coded because email can't consume CSS variables. Token map is in the comment at the top of the template: `text/primary #0F0F0F` (the only text colour), `surface/action #7BE7D8` with black ink, `text/link #00787D`, the aqua family `#B8FDF4 / #7BE7D8 / #76DECF / #70BEB3` for the card gradient, `border/subtle #E7E7E7` for hairlines.
- **Type:** Geologica Light 300 body, SemiBold 600 headings, role sizes from the foundations (32/38 h1 mobile → 28 on small screens, 16 body, 14 secondary, 12 caption, 48 amount). Google Fonts link for Apple Mail / iOS; Arial fallback elsewhere.
- **Buttons are the DS button:** 50px, 16/24 SemiBold, 4px radius, primary uppercase on Primary Aqua with black label, secondary white with `#70BEB3` outline and sentence case.
- **The card is the hero.** One object, 400×~250 at credit-card proportion, aqua gradient (brand-light-2 → primary → dark-1 → dark-2) with a soft highlight and drop shadow, amount centred at 60px, recipient name and expiry on the bottom edge like a real card. Flat Primary Aqua fallback where gradients or shadows aren't supported. The old black bezels and the mid-card fascia strip are gone; the fascias sit in a quiet "Also spend it at" row above the footer.
- **One ink, two weights.** Everything is `#0F0F0F`; labels are Light 300, values SemiBold 600. No grey text, no grey panels — hairlines only. Fascia logos are black.
- **Number and PIN** sit directly under the card, Light label over SemiBold value, no box. They were previously grey-on-dark inside a dashed box.
- **Scenario-specific copy.** Refund: "Your £40.25 refund, ready to spend" plus an Order / Refund method / Valid until fact list. Gift: "A gift for you", sender's message in a Neutral panel. The old template said "A gift for you!" to refund customers and buried the 90-day validity in a paragraph.
- **Buttons side by side** on desktop (Shop now primary, Check balance secondary), stacked on mobile. Header nav row dropped — it's a transactional email.
- **How to redeem** as three numbered steps (01/02/03) under a hairline.
- **Radius:** 4 (buttons), 18 (card — the hero object only).
- Not in scope: dark-mode colour swap (`color-scheme` locked to light), Outlook rounded corners (falls back to square), per-fascia variants (Debenhams only — the group fascias share this card).

## Merge fields

`recipient_name` · `amount` · `card_number` · `pin` · `expiry_date` · `is_refund` · `order_ref` · `sender_name` · `message` · `shop_url` · `balance_url` · `terms_url` · `privacy_url`

## Source

- Original email: thread "You've been sent a gift card!" (10 Nov 2025 to Jake; 8 Sep 2026 refund case from Adam Kerr forwarded to Demi Adesanya). Screens in the brief.
- Design system: github.com/jakerayner96/debenhamsgroup.design (`assets/ds/tokens.css`, `.context/07-foundations.md`).
- Figma: none yet — code first, Figma downstream.

## Working on it

Single-file HTML, no build step. Edit `template/giftcard.html`, check it in `index.html`, push to `main` — GitHub Pages serves the repo root. Regenerate logo PNGs from the DS SVGs with headless Chrome at 2× if the marks change.
