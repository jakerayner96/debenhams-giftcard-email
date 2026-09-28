// Builds template/<brand>.html for every fascia in brands.json from template/giftcard.src.html.
// Usage: node build.mjs        Logos: python3 tools/logos.py (once, or when a wordmark changes)
import fs from 'node:fs';
const BASE = 'https://jakerayner96.github.io/debenhams-giftcard-email/assets/logos/';
const { brands } = JSON.parse(fs.readFileSync('brands.json', 'utf8'));
const src = fs.readFileSync('template/giftcard.src.html', 'utf8');
const hasSvg = id => fs.existsSync(`assets/logos/svg/${id}.svg`);
const logoDims = id => {
  if (!hasSvg(id)) return { w: 0, h: 0, cw: 0, ch: 0 };
  const svg = fs.readFileSync(`assets/logos/svg/${id}.svg`, 'utf8');
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
  const aspect = vb[2] / vb[3];
  let h, w;
  if (aspect >= 5) { h = Math.max(14, Math.round(136 / aspect)); w = Math.round(h * aspect); } else { h = 28; w = Math.round(28 * aspect); }
  return { w, h, cw: Math.round(w * 0.85), ch: Math.round(h * 0.85) };
};
const today = new Date().toISOString().slice(0, 10);
const byId = Object.fromEntries(brands.map(b => [b.id, b]));
// "Also spend it at" — satellite wordmarks at 14px high (12px for the very wide ones), black on the page
const satellites = b => {
  if (!b.satellites || !b.satellites.length) return '';
  const imgs = b.satellites.map(id => {
    const d = logoDims(id); let h = 14, w = Math.round(d.w * 14 / d.h); if (w > 80) { w = 80; h = Math.round(d.h * 80 / d.w); }
    return `        <img src="${BASE}${id}.png" width="${w}" height="${h}" alt="${byId[id].name}" style="display:inline-block;width:${w}px;height:${h}px;margin:8px 12px;vertical-align:middle">`;
  }).join('\n');
  return `    <!-- ===== spend across the group — Debenhams satellites ===== -->
    <tr>
      <td class="gutter" align="center" style="padding:40px 32px 0 32px;font-family:${b.font};font-size:12px;line-height:16px;font-weight:${b.light};color:${b.ink}">Also spend it at</td>
    </tr>
    <tr>
      <td class="gutter" align="center" style="padding:8px 20px 0 20px;font-size:0;line-height:0">
${imgs}
      </td>
    </tr>

`;
};
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
    SATELLITES: satellites(b),
    // wordmark: PNG from the DS SVG, or a text wordmark for fascias the DS has no mark for yet
    HEADER_LOGO: hasSvg(b.id)
      ? `<img src="${BASE}${b.id}.png" width="${d.w}" height="${d.h}" alt="${b.name}" style="display:block;width:${d.w}px;height:${d.h}px">`
      : `<span style="display:inline-block;font-family:${b.font};font-size:20px;line-height:24px;font-weight:${b.strong};letter-spacing:-0.01em;color:${b.ink}">${b.name}</span>`,
    CARD_LOGO: hasSvg(b.id)
      ? `<img src="${BASE}${b.id}-white.png" width="${d.cw}" height="${d.ch}" alt="${b.name}" style="display:block;width:${d.cw}px;height:${d.ch}px">`
      : `<span style="display:inline-block;font-family:${b.font};font-size:17px;line-height:20px;font-weight:${b.strong};letter-spacing:-0.01em;color:#FFFFFF">${b.name}</span>`,
  };
  let out = src.replace(/\[\[([A-Z_]+)\]\]/g, (m, k) => { if (!(k in map)) throw new Error(`no value for ${m}`); return String(map[k]); });
  fs.writeFileSync(`template/${b.id}.html`, out);
  console.log(`template/${b.id}.html`, d);
}
