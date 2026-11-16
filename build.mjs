// Builds template/<brand>.html for every active fascia in brands.json from template/giftcard.src.html.
// Usage: node build.mjs        Logos: python3 tools/logos.py (once, or when a wordmark changes)
import fs from 'node:fs';
const BASE = 'https://jakerayner96.github.io/debenhams-giftcard-email/assets/logos/';
const { brands, satellites: GROUP = [], satellitesLabel: LABEL } = JSON.parse(fs.readFileSync('brands.json', 'utf8'));
const src = fs.readFileSync('template/giftcard.src.html', 'utf8');
const byId = Object.fromEntries(brands.map(b => [b.id, b]));
const hasSvg = id => fs.existsSync(`assets/logos/svg/${id}.svg`);

// Header wordmark size from the SVG's aspect: wide marks fit 136px, squarer marks sit at 28px high. Card mark is 85% of that.
const logoDims = id => {
  if (!hasSvg(id)) return { w: 0, h: 0, cw: 0, ch: 0 };
  const svg = fs.readFileSync(`assets/logos/svg/${id}.svg`, 'utf8');
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
  const aspect = vb[2] / vb[3];
  let h, w;
  if (aspect >= 5) { h = Math.max(14, Math.round(136 / aspect)); w = Math.round(h * aspect); } else { h = 28; w = Math.round(28 * aspect); }
  return { w, h, cw: Math.round(w * 0.85), ch: Math.round(h * 0.85) };
};

// "Your gift card can also be used at" — Figma component "Also spend it at" (Emails - 2026 131:7829): four rows of four marks,
// 36px apart, rows 24px apart, 14px label. Every other fascia; Debenhams takes the current fascia's own slot (Debenhams' email lists the 16).
// Each mark is a light/dark pair: black PNG by default, white PNG in dark mode.
const swapImg = (id, w, h, alt, extra = '') =>
  `<img class="lm" src="${BASE}${id}.png" width="${w}" height="${h}" alt="${alt}" style="display:inline-block;width:${w}px;height:${h}px;vertical-align:middle;${extra}">` +
  `<!--[if !mso]><!--><img class="dm-i" src="${BASE}${id}-white.png" width="${w}" height="${h}" alt="${alt}" style="display:none;max-height:0;overflow:hidden;width:0;height:${h}px;vertical-align:middle;${extra}"><!--<![endif]-->`;
const satellites = b => {
  const all = GROUP.map(s => typeof s === 'string' ? { id: s } : s);
  const deb = all.find(s => s.id === 'debenhams');
  let items = all.filter(s => s.id !== 'debenhams');
  if (b.id !== 'debenhams') items = items.map(s => s.id === b.id ? deb : s);
  items = items.filter(s => byId[s.id] && !byId[s.id].disabled && hasSvg(s.id));
  if (!items.length) return '';
  const rows = [];
  for (let i = 0; i < items.length; i += 4) rows.push(items.slice(i, i + 4));
  const row = (r, i) => `    <tr>
      <td class="gutter" align="center" style="padding:${i ? 24 : 20}px 32px 0 32px">
        <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr>
${r.map((s, k) => `          <td valign="middle" style="padding:0 ${k < r.length - 1 ? 18 : 0}px 0 ${k ? 18 : 0}px;font-size:0;line-height:0">${swapImg(s.id, s.w, s.h, byId[s.id].name)}</td>`).join('\n')}
        </tr></table>
      </td>
    </tr>`;
  const label = LABEL || 'Your gift card can also be used at';
  return `    <!-- ===== spend across the group — Figma "Also spend it at": 4 rows of 4, Debenhams in this fascia's slot ===== -->
    <tr>
      <td class="gutter d-ink" align="center" style="padding:40px 32px 0 32px;font-family:${b.font};font-size:14px;line-height:20px;font-weight:${b.light};color:${b.ink}">${label}</td>
    </tr>
${rows.map(row).join('\n')}

`;
};

// Dark mode (Figma Dark rows): the button keeps the fascia colour only where it reads on #0F0F0F (Debenhams aqua); PLT goes light cream
// with garnet ink; every other fascia goes white with black ink. Links: Debenhams aqua, everyone else white.
const darkTokens = b => {
  if (b.id === 'debenhams') return { action: b.action, onAction: b.onAction, link: '#7BE7D8' };
  if (b.id === 'plt') return { action: '#FFE4D2', onAction: '#550503', link: '#FFFFFF' };
  return { action: '#FFFFFF', onAction: '#000000', link: '#FFFFFF' };
};

const today = new Date().toISOString().slice(0, 10);
for (const b of brands) {
  if (b.disabled) { try { fs.unlinkSync(`template/${b.id}.html`); } catch {} console.log(`template/${b.id}.html — skipped (disabled)`); continue; }
  const d = logoDims(b.id);
  const map = {
    BRAND: b.name, BRAND_ID: b.id, DOMAIN: b.domain, DATE: today,
    FONT: b.font, FONT_LINK: b.gfont ? `<link href="https://fonts.googleapis.com/css2?family=${b.gfont}&display=swap" rel="stylesheet" type="text/css">` : '',
    W_LIGHT: b.light, W_MID: b.mid, W_STRONG: b.strong, W_BTN: b.btn, CTA_CASE: b.ctaCase, RADIUS: b.radius + 'px',
    ACTION: b.action, ACTION_HOVER: b.actionHover, ON_ACTION: b.onAction, LINK: b.link, PAGE: b.page, INK: b.ink,
    HAIRLINE: b.hairline, BANNER_BG: b.bannerBg, CARD: '#0F0F0F', CARD_INK: '#FFFFFF',
    GREY: b.id === 'plt' ? '#6B6B6B' : '#767676', // #767676 is 4.47:1 on PLT's #FFFDF7, so PLT's caption is Grey 5
    D_ACTION: darkTokens(b).action, D_ON_ACTION: darkTokens(b).onAction, D_LINK: darkTokens(b).link,
    LOGO_BLACK: `${BASE}${b.id}.png`, LOGO_WHITE: `${BASE}${b.id}-white.png`,
    LOGO_W: d.w, LOGO_H: d.h, CARD_LOGO_W: d.cw, CARD_LOGO_H: d.ch,
    SATELLITES: satellites(b),
    // wordmark: PNG from the DS SVG, or a text wordmark for fascias the DS has no mark for yet
    HEADER_LOGO: hasSvg(b.id)
      ? `<img class="lm" src="${BASE}${b.id}.png" width="${d.w}" height="${d.h}" alt="${b.name}" style="display:block;width:${d.w}px;height:${d.h}px"><!--[if !mso]><!--><div class="dm" style="display:none;max-height:0;overflow:hidden"><img src="${BASE}${b.id}-white.png" width="${d.w}" height="${d.h}" alt="${b.name}" style="display:block;width:${d.w}px;height:${d.h}px"></div><!--<![endif]-->`
      : `<span style="display:inline-block;font-family:${b.font};font-size:20px;line-height:24px;font-weight:${b.strong};letter-spacing:-0.01em;color:${b.ink}">${b.name}</span>`,
    CARD_LOGO: hasSvg(b.id)
      ? `<img src="${BASE}${b.id}-white.png" width="${d.cw}" height="${d.ch}" alt="${b.name}" style="display:block;width:${d.cw}px;height:${d.ch}px">`
      : `<span style="display:inline-block;font-family:${b.font};font-size:17px;line-height:20px;font-weight:${b.strong};letter-spacing:-0.01em;color:#FFFFFF">${b.name}</span>`,
  };
  const out = src.replace(/\[\[([A-Z_]+)\]\]/g, (m, k) => { if (!(k in map)) throw new Error(`no value for ${m}`); return String(map[k]); });
  fs.writeFileSync(`template/${b.id}.html`, out);
  console.log(`template/${b.id}.html`, d);
}
