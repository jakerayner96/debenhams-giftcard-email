# Debenhams gift card email — redesign

Redesign of the transactional "You've been sent a gift card!" email (sender `giftcard@orders.emaildebenhams.com`, Mailgun, template "GIFT CARD SEND V2"). Covers both scenarios the one template serves today: **refund to gift card** and **gift card sent by someone**.

**Live preview:** https://jakerayner96.github.io/debenhams-giftcard-email/ · **Template:** [`template/giftcard.html`](template/giftcard.html)

## What's here

| Path | What |
|---|---|
| `index.html` | Preview shell — New vs Original, Refund vs Gift, 375 / 600 / 760, editable merge fields, copy rendered HTML. Serve over HTTP (`python3 -m http.server 3000`). |
| `template/giftcard.html` | The email. Table layout, inline styles, 600px, MSO guards, Mailgun handlebars merge fields (`{{amount}}`, `{{#if is_refund}}…{{else}}…{{/if}}`). |
| `assets/logos/` | 2× PNGs rendered from the design-system brand SVGs (`debenhamsgroup.design/assets/brands`). Fascia strip logos are black `#0F0F0F`; `debenhams-white.png` is the same mark recoloured for the black card. Referenced by absolute Pages URL in the template. |
| `original/giftcard-original.html` | The Nov 2025 production email, extracted from the `.eml`, card number / PIN / recipient redacted, Outlook safelinks unwrapped. Images still load from the live CDN. |

## Design decisions

- **Debenhams mode of the group design system**, hard-coded because email can't consume CSS variables. Token map is in the comment at the top of the template: `text/primary #0F0F0F` (the only text colour on the page), `surface/action #7BE7D8` for the button, links and the PIN-notice rule, `border/subtle #E7E7E7` for hairlines.
- **The card is black for every fascia.** Flat `#0F0F0F`, white ink, 10px corners, no gradient and no shadow (per Paul, 28 Sep 2026: they don't render reliably in mail clients). The fascia accent is carried by the Shop now button only, so a per-brand variant is a one-colour swap.
- **Everything needed to redeem is on the card:** amount top-right, card number, PIN and Use by, laid out like a physical gift card. The number and PIN no longer sit in a separate block under the card.
- **Gift scenario order** follows Paul's mock: logo → "{{recipient_name}}, {{sender_name}} has sent you a gift" (uppercase SemiBold) → the sender's message as an italic Georgia pull-quote → "Here's your gift card. Keep this email safe…" → card → button → Check your balance. His gift-box illustration is not used; the card is the hero. Refund keeps "Hi {{recipient_name}}, / Your refund, ready to spend" and its Order / Refunded to / Valid for fact list.
- **Type:** Geologica Light 300 body, SemiBold 600 headings, role sizes from the foundations (36/42 h1 → 30 on small screens; gift headline 34/40 → 28; 16 body, 14 labels, 12 caption). Georgia italic for the gift message only (Geologica has no italic; Georgia is universally installed). Google Fonts link for Apple Mail / iOS; Arial fallback elsewhere.
- **The button is the DS primary button:** 50px, 16/24 SemiBold, 4px radius, uppercase on Primary Aqua with black label. **Check your balance** is a text link beneath it (`balance_url`).
- **Links are aqua `#7BE7D8`, SemiBold, no underline** (Jake, 28 Sep 2026). Note aqua on white is well below AA contrast for text; weight and position carry them.
- **How to spend it** is two columns, Online / In the app, replacing the 01/02/03 steps. **Treat your PIN like cash** sits under it with a 3px aqua left rule — no grey panel.
- **One ink, two weights.** Everything on the page is `#0F0F0F`; labels are Light 300, values SemiBold 600. No grey text, no grey panels — hairlines only. Fascia logos are black.
- **Footer** adds "Sent on behalf of {{sender_name}}. Order reference {{order_ref}}." for the gift scenario so support has a handle.
- **Radius:** 4 (buttons), 10 (card).
- Not in scope: dark-mode colour swap (`color-scheme` locked to light), Outlook rounded corners (falls back to square), per-fascia variants (Debenhams only — swapping `#7BE7D8` on the button is the whole job now).

## Merge fields

`recipient_name` · `amount` · `card_number` · `pin` · `expiry_date` · `is_refund` · `order_ref` (both scenarios) · `sender_name` · `message` · `shop_url` · `balance_url` · `terms_url` · `privacy_url`

## Source

- Original email: thread "You've been sent a gift card!" (10 Nov 2025 to Jake; 8 Sep 2026 refund case from Adam Kerr forwarded to Demi Adesanya). Screens in the brief.
- Design system: github.com/jakerayner96/debenhamsgroup.design (`assets/ds/tokens.css`, `.context/07-foundations.md`).
- Figma: none yet — code first, Figma downstream.

## Working on it

Single-file HTML, no build step. Edit `template/giftcard.html`, check it in `index.html`, push to `main` — GitHub Pages serves the repo root. Regenerate logo PNGs from the DS SVGs with headless Chrome at 2× if the marks change.
