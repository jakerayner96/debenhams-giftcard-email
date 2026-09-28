# Group gift card email — redesign

Redesign of the transactional "You've been sent a gift card!" email (Mailgun, template "GIFT CARD SEND V2"), built for **every fascia** from one source template. Covers both scenarios the template serves: **refund to gift card** and **gift card sent by someone**.

**Live preview:** https://jakerayner96.github.io/debenhams-giftcard-email/ — brand tabs across the top, scenario and device on the left. · **Figma:** https://www.figma.com/design/XbDt0A59FmPQN3pj7RevaG (Debenhams frames; the template is the source of truth).

## What's here

| Path | What |
|---|---|
| `template/giftcard.src.html` | **The source.** Table layout, inline styles, 600px, MSO guards, Mailgun handlebars merge fields, `[[TOKEN]]` placeholders for the fascia values. Edit this. |
| `brands.json` | One entry per fascia: font, weights, button case and radius, `surface/action`, `text/on-action`, `text/link`, `surface/page`, hairline, PIN-notice surface, domain. Values from `debenhamsgroup.design/assets/ds/tokens.css` (Colour Alignment set). |
| `build.mjs` | `node build.mjs` → writes `template/<brand>.html` for every fascia. Generated files; don't hand-edit. |
| `template/<brand>.html` | The 14 built emails (debenhams, boohoo, boohooman, plt, karenmillen, nastygal, misspap, coast, oasis, warehouse, wallis, burton, dorothyperkins, principles). Hand one to Mailgun per fascia. |
| `tools/logos.py` | Renders the wordmarks in `assets/logos/svg/` (copies of the DS brand SVGs) to 2× PNGs: `<brand>.png` black for the header, `<brand>-white.png` for the card. Needs Chrome + Pillow. |
| `index.html` | Preview shell. Brand tabs on top (the PLP/PDP prototype pattern), Refund / Gift, 375 / 600 / 760, editable merge fields, copy rendered HTML. Serve over HTTP (`python3 -m http.server 3000`). |

## Design decisions

- **One template, fascia by tokens.** The page is `surface/page`, text is `text/primary`, the button is `surface/action` with `text/on-action` ink at the fascia's radius and button case, links and the PIN-notice rule are `text/link`, hairlines `border/subtle`. Type is the fascia's `--font-family-base` with its regular / mid / strong weights (Google Fonts link for Apple Mail and iOS; Arial or Helvetica fallback elsewhere; Warehouse and Nasty Gal have no web font and render in the system Helvetica/Arial everywhere).
- **The card is black for every fascia** (Paul, 28 Sep 2026): flat `#0F0F0F`, white ink, 400×252 ISO card proportion, 10px corners, no gradient, no shadow — they don't render reliably in mail clients. Layout is the v2.1 card: wordmark and "Gift card" label on top, amount centred at 60px, "Valid until" centred on the bottom edge. The number and PIN sit centred and stacked under the card.
- **Order of elements** follows Paul's mock (28 Sep): wordmark → "Hi {{recipient_name}}," → headline → (gift) the sender's message in italics with quote marks and the sender's name → "Here's your gift card. You'll need the card number and PIN to spend it." → card → number + PIN → Shop now → Check your balance → (refund) Order / Refunded to / Valid for → Online / In the app → PIN notice → footer links. His gift-box illustration is not used; the card is the hero.
- **Headlines:** refund "Your Gift Card"; gift "{{sender_name}} has sent you a Gift Card" (Jake, 28 Sep — sentence case, not caps).
- **Links are `text/link`, SemiBold, no underline.** For Debenhams that's CTA Aqua `#00787D`; Primary Aqua `#7BE7D8` is the button fill only (fails AA as text on white).
- **PIN notice** is the DS Messaging Banner, neutral: 4px `text/link` rule, `surface/media` panel, 4px radius, mid-weight lead.
- **Footer** is the three links only. The "Sent on behalf of…" line and the registered-company line were dropped in the Figma pass (28 Sep); check legal is happy before send.
- **No fascia strip.** The "Also spend it at" row was removed.
- Not in scope: dark-mode colour swap (`color-scheme` locked to light), Outlook rounded corners (falls back to square).

## Merge fields

`recipient_name` · `amount` · `card_number` · `pin` · `expiry_date` · `is_refund` · `order_ref` · `sender_name` · `message` · `shop_url` · `balance_url` · `terms_url` · `privacy_url`

## Working on it

Edit `template/giftcard.src.html` or `brands.json`, run `node build.mjs`, check in `index.html`, push to `main` — GitHub Pages serves the repo root. Re-run `python3 tools/logos.py` if a wordmark changes.

## Source

- Original email: thread "You've been sent a gift card!" (10 Nov 2025; 8 Sep 2026 refund case from Adam Kerr forwarded to Demi Adesanya). The extracted original was in `original/` until v3 — see git history.
- Design system: github.com/jakerayner96/debenhamsgroup.design (`assets/ds/tokens.css`, `.context/07-foundations.md`).
