/**
 * Parse all .gpx files in public/templates/ → JSON in data/templates/
 * Usage: node scripts/parse-templates.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const GPX_DIR = join(ROOT, 'public', 'templates');
const OUT_DIR = join(ROOT, 'data', 'templates');
const CANVAS = 3240;

// --- helpers ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGpx(content) {
  const matches = content.match(/<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>(?:\s*<ele>([^<]+)<\/ele>)?/g);
  if (!matches) return [];
  return matches.map(m => {
    const lat = m.match(/lat="([^"]+)"/);
    const lon = m.match(/lon="([^"]+)"/);
    const ele = m.match(/<ele>([^<]+)<\/ele>/);
    return {
      lat: parseFloat(lat[1]),
      lon: parseFloat(lon[1]),
      ele: ele ? parseFloat(ele[1]) : 0,
    };
  });
}

function computeStats(pts) {
  let dist = 0, gain = 0;
  for (let i = 1; i < pts.length; i++) {
    dist += haversine(pts[i - 1].lat, pts[i - 1].lon, pts[i].lat, pts[i].lon);
    if (pts[i].ele > pts[i - 1].ele) gain += pts[i].ele - pts[i - 1].ele;
  }
  return { distance: Math.round(dist / 1000), elevationGain: Math.round(gain) };
}

function toCanvas(pts, closed) {
  const lats = pts.map(p => p.lat), lngs = pts.map(p => p.lon);
  let mnLat = Math.min(...lats), mxLat = Math.max(...lats);
  let mnLng = Math.min(...lngs), mxLng = Math.max(...lngs);
  const pad = 0.06;
  const latR = (mxLat - mnLat) || 0.001;
  const lngR = (mxLng - mnLng) || 0.001;
  mnLat -= latR * pad; mxLat += latR * pad;
  mnLng -= lngR * pad; mxLng += lngR * pad;

  const step = Math.max(1, Math.floor(pts.length / 800));
  const cpts = [];
  for (let i = 0; i < pts.length; i += step) {
    const x = Math.round((pts[i].lon - mnLng) / (mxLng - mnLng) * CANVAS);
    const y = Math.round(CANVAS - (pts[i].lat - mnLat) / (mxLat - mnLat) * CANVAS);
    cpts.push([x, y]);
  }
  const last = pts[pts.length - 1];
  cpts.push([
    Math.round((last.lon - mnLng) / (mxLng - mnLng) * CANVAS),
    Math.round(CANVAS - (last.lat - mnLat) / (mxLat - mnLat) * CANVAS),
  ]);

  let pd = `M ${cpts[0][0]} ${cpts[0][1]}`;
  for (let i = 1; i < cpts.length; i++) pd += ` L ${cpts[i][0]} ${cpts[i][1]}`;
  if (closed) pd += ' Z';

  const tw = 300, th = 200, m = 0.1;
  const sx = tw * (1 - 2 * m) / CANVAS, sy = th * (1 - 2 * m) / CANVAS;
  let tp = `M ${Math.round(tw * m + cpts[0][0] * sx)} ${Math.round(th * m + cpts[0][1] * sy)}`;
  for (let i = 1; i < cpts.length; i++) tp += ` L ${Math.round(tw * m + cpts[i][0] * sx)} ${Math.round(th * m + cpts[i][1] * sy)}`;
  if (closed) tp += ' Z';

  return { pathData: pd, thumbnailPath: tp };
}

// --- generate missing indexes ---
let idx = 10; // start after manual ones

const gpxFiles = readdirSync(GPX_DIR).filter(f => f.endsWith('.gpx'));
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

for (const fname of gpxFiles) {
  const content = readFileSync(join(GPX_DIR, fname), 'utf-8');
  const name = fname.replace('.gpx', '');
  const filename = fname.replace('.gpx', '');

  // Check if JSON already exists (skip manual ones)
  const jsonName = filename + '.json';
  const fullJsonPath = join(OUT_DIR, jsonName);
  if (existsSync(fullJsonPath)) {
    console.log(`⏭  ${fname} → ${jsonName} (already exists)`);
    continue;
  }

  const pts = parseGpx(content);
  if (pts.length < 2) { console.log(`⚠  ${fname}: not enough points`); continue; }

  const stats = computeStats(pts);
  const distEnd = haversine(pts[0].lat, pts[0].lon, pts[pts.length - 1].lat, pts[pts.length - 1].lon);
  const closed = distEnd < 2000;
  const { pathData, thumbnailPath } = toCanvas(pts, closed);
  if (!pathData) { console.log(`⚠  ${fname}: empty path`); continue; }

  // Determine difficulty
  let difficulty = 'medium';
  if (stats.distance >= 100 || stats.elevationGain >= 2000) difficulty = 'hard';
  else if (stats.distance <= 30 && stats.elevationGain < 300) difficulty = 'easy';

  const obj = {
    id: filename,
    name,
    description: `${name}骑行线路`,
    region: '自定义',
    difficulty,
    length: `${stats.distance}km`,
    startName: '起点',
    endName: closed ? '起点' : '终点',
    totalDistance: stats.distance,
    elevationGain: stats.elevationGain,
    startCell: 0,
    endCell: closed ? 0 : 8,
    pathData,
    thumbnailPath,
  };

  writeFileSync(fullJsonPath, JSON.stringify(obj), 'utf-8');

  // Auto-import into route-templates.ts
  console.log(`✅ ${fname} → ${jsonName} (${stats.distance}km · ${stats.elevationGain}m · ${pts.length} pts)`);
}

console.log('\n📋 Next: manually add the import & entry in lib/route-templates.ts');
