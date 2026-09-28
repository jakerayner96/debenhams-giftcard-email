// Builds template/<brand>.html for every fascia in brands.json from template/giftcard.src.html.
// Usage: node build.mjs        Logos: python3 tools/logos.py (once, or when a wordmark changes)
import fs from 'node:fs';
const BASE = 'https://jakerayner96.github.io/debenhams-giftcard-email/assets/logos/';
const { brands } = JSON.parse(fs.readFileSync('brands.json', 'utf8'));
const src = fs.readFileSync('template/giftcard.src.html', 'utf8');
const logoDims = id => {
  const svg = fs.readFileSync(`assets/logos/svg/${id}.svg`, 'utf8');
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
  const aspect = vb[2] / vb[3];
  let h, w;
  if (aspect >= 5) { h = Math.max(14, Math.round(136 / aspect)); w = Math.round(h * aspect); } else { h = 28; w = Math.round(28 * aspect); }
  return { w, h, cw: Math.round(w * 0.85), ch: Math.round(h * 0.85) };
};
const today = new Date().toISOString().slice(0, 10);
for (const b of brands) {
  const d = logoDims(b.id);
  const map = {
    BRAND: b.name, BRAND_ID: b.id, DOMAIN: b.domain, DATE: today,
    FONT: b.font, FONT_LINK: b.gfont ? `<link href="https://fonts.googleapis.com/css2?family=${b.gfont}&display=swap" rel="stylesheet" type="text/css">` : '',
    W_LIGHT: b.light, W_MID: b.mid, W_STRONG: b.strong, W_BTN: b.btn, CTA_CASE: b.ctaCase, RADIUS: b.radius + 'px',
    ACTION: b.action, ACTION_HOVER: b.actionHover, ON_ACTION: b.onAction, LINK: b.link, PAGE: b.page, INK: b.ink,
    HAIRLINE: b.hairline, BANNER_BG: b.bannerBg, CARD: '#0F0F0F', CARD_INK: '#FFFFFF',
    LOGO_BLACK: `${BASE}${b.id}.png`, LOGO_WHITE: `${BASE}${b.id}-white.png`,
    LOGO_W: d.w, LOGO_H: d.h, CARD_LOGO_W: d.cw, CARD_LOGO_H: d.ch,
  };
  let out = src.replace(/\[\[([A-Z_]+)\]\]/g, (m, k) => { if (!(k in map)) throw new Error(`no value for ${m}`); return String(map[k]); });
  fs.writeFileSync(`template/${b.id}.html`, out);
  console.log(`template/${b.id}.html`, d);
}
