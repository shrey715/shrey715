// Generates src/data/glyphs.json: Anton glyph outlines as SVG path data, so
// display type can be *drawn* (stroke-traced like a pen plotter) client-side
// without shipping the font parser. Re-run after changing the character set:
//   node scripts/build-glyphs.mjs
import opentype from 'opentype.js';
import { readFileSync, writeFileSync } from 'fs';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?&.,:;/-—()[]\'"+@#%*<>_ ';
const buf = readFileSync('src/assets/fonts/Anton-Regular.ttf');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const SIZE = 100; // glyphs are emitted at a 100-unit em; consumers scale
const r = (n) => Math.round(n * 10) / 10;

const glyphs = {};
for (const ch of CHARS) {
  const g = font.charToGlyph(ch);
  const path = g.getPath(0, 0, SIZE);
  // Round coordinates to keep the JSON small.
  const d = path.commands
    .map((c) => {
      switch (c.type) {
        case 'M': return `M${r(c.x)} ${r(c.y)}`;
        case 'L': return `L${r(c.x)} ${r(c.y)}`;
        case 'Q': return `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
        case 'C': return `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
        case 'Z': return 'Z';
        default: return '';
      }
    })
    .join('');
  glyphs[ch] = { d, w: r((g.advanceWidth / font.unitsPerEm) * SIZE) };
}

const scale = SIZE / font.unitsPerEm;
const out = {
  size: SIZE,
  ascender: r(font.ascender * scale),
  descender: r(font.descender * scale),
  capHeight: r((font.tables.os2?.sCapHeight ?? font.ascender * 0.7) * scale),
  glyphs,
};
writeFileSync('src/data/glyphs.json', JSON.stringify(out));
console.log(`wrote ${Object.keys(glyphs).length} glyphs, ${JSON.stringify(out).length} bytes, capHeight ${out.capHeight}`);
