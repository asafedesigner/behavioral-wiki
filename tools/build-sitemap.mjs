// Gera sitemap.xml a partir das páginas publicadas.
// Roda em todo deploy da Vercel (buildCommand), então qualquer página nova
// entra no sitemap sozinha, com a data da última mudança do conteúdo.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || process.cwd();
const SKIP = new Set(['node_modules', '.git', 'tools', '.vercel']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const meta = (html, re) => (html.match(re) || [])[1];
const entries = [];
for (const file of walk(ROOT)) {
  const html = readFileSync(file, 'utf8');
  const robots = meta(html, /<meta name="robots" content="([^"]*)"/i) || '';
  if (/noindex/i.test(robots)) continue;
  const loc = meta(html, /<link rel="canonical" href="([^"]+)"/i);
  if (!loc) { console.warn('sem canonical, fora do sitemap:', relative(ROOT, file)); continue; }
  const lastmod = meta(html, /<meta property="og:updated_time" content="([^"]+)"/i);
  entries.push({ loc, lastmod });
}

const depth = u => new URL(u).pathname.split('/').filter(Boolean).length;
entries.sort((a, b) => depth(a.loc) - depth(b.loc) || a.loc.localeCompare(b.loc));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + entries.map(e => '  <url>\n    <loc>' + esc(e.loc) + '</loc>\n'
      + (e.lastmod && !e.lastmod.startsWith('__') ? '    <lastmod>' + e.lastmod + '</lastmod>\n' : '')
      + '  </url>').join('\n')
  + '\n</urlset>\n';
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log('sitemap.xml:', entries.length, 'URLs');
