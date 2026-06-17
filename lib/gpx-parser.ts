/**
 * Browser-side GPX parser — parses GPX files into RouteTemplate objects.
 */
import { RouteTemplate } from './types';

const CANVAS = 3240;

interface GpxPoint { lat: number; lon: number; ele: number }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGpxXml(xml: string): GpxPoint[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const points: GpxPoint[] = [];

  // Handle parse errors
  const err = doc.querySelector('parsererror');
  if (err) {
    // Try regex fallback for malformed GPX
    const matches = xml.match(/<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>(?:\s*<ele>([^<]+)<\/ele>)?/g);
    if (matches) {
      for (const m of matches) {
        const latM = m.match(/lat="([^"]+)"/);
        const lonM = m.match(/lon="([^"]+)"/);
        const eleM = m.match(/<ele>([^<]+)<\/ele>/);
        if (latM && lonM) {
          points.push({ lat: parseFloat(latM[1]), lon: parseFloat(lonM[1]), ele: eleM ? parseFloat(eleM[1]) : 0 });
        }
      }
    }
    return points;
  }

  const trkpts = doc.querySelectorAll('trkpt');
  trkpts.forEach((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lon = parseFloat(pt.getAttribute('lon') || '0');
    const eleEl = pt.querySelector('ele');
    const ele = eleEl ? parseFloat(eleEl.textContent || '0') : 0;
    points.push({ lat, lon, ele });
  });

  return points;
}

function projectToCanvas(points: GpxPoint[], closed: boolean): { pathData: string; thumbnailPath: string } {
  if (points.length < 2) return { pathData: '', thumbnailPath: '' };

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lon);
  let mnLat = Math.min(...lats), mxLat = Math.max(...lats);
  let mnLng = Math.min(...lngs), mxLng = Math.max(...lngs);
  const latR = mxLat - mnLat || 0.001;
  const lngR = mxLng - mnLng || 0.001;
  const pad = 0.06;
  mnLat -= latR * pad; mxLat += latR * pad;
  mnLng -= lngR * pad; mxLng += lngR * pad;
  const effLatR = mxLat - mnLat;
  const effLngR = mxLng - mnLng;

  const step = Math.max(1, Math.floor(points.length / 800));
  const canvasPts: [number, number][] = [];
  for (let i = 0; i < points.length; i += step) {
    const p = points[i];
    const x = Math.round(((p.lon - mnLng) / effLngR) * CANVAS);
    const y = Math.round(CANVAS - ((p.lat - mnLat) / effLatR) * CANVAS);
    canvasPts.push([x, y]);
  }
  const last = points[points.length - 1];
  const lx = Math.round(((last.lon - mnLng) / effLngR) * CANVAS);
  const ly = Math.round(CANVAS - ((last.lat - mnLat) / effLatR) * CANVAS);
  if (canvasPts[canvasPts.length - 1][0] !== lx || canvasPts[canvasPts.length - 1][1] !== ly) {
    canvasPts.push([lx, ly]);
  }

  // Path data
  let pd = `M ${canvasPts[0][0]} ${canvasPts[0][1]}`;
  for (let i = 1; i < canvasPts.length; i++) pd += ` L ${canvasPts[i][0]} ${canvasPts[i][1]}`;
  if (closed) pd += ' Z';

  // Thumbnail
  const tw = 300, th = 200, m = 0.1;
  const sx = tw * (1 - 2 * m) / CANVAS;
  const sy = th * (1 - 2 * m) / CANVAS;
  const ox = tw * m, oy = th * m;
  const scaled = canvasPts.map(([x, y]) => [Math.round(ox + x * sx), Math.round(oy + y * sy)] as [number, number]);
  let tp = `M ${scaled[0][0]} ${scaled[0][1]}`;
  for (let i = 1; i < scaled.length; i++) tp += ` L ${scaled[i][0]} ${scaled[i][1]}`;
  if (closed) tp += ' Z';

  return { pathData: pd, thumbnailPath: tp };
}

function computeStats(pts: GpxPoint[]): { distance: number; elevationGain: number } {
  let dist = 0, gain = 0;
  for (let i = 1; i < pts.length; i++) {
    dist += haversine(pts[i - 1].lat, pts[i - 1].lon, pts[i].lat, pts[i].lon);
    const dEle = pts[i].ele - pts[i - 1].ele;
    if (dEle > 0) gain += dEle;
  }
  return { distance: Math.round(dist / 1000), elevationGain: Math.round(gain) };
}

export function parseGpxFile(name: string, xml: string): RouteTemplate | null {
  const pts = parseGpxXml(xml);
  if (pts.length < 2) return null;

  // Downsample if too many points
  let usePts = pts;
  if (pts.length > 4000) usePts = pts.filter((_, i) => i % Math.ceil(pts.length / 3000) === 0);

  const stats = computeStats(usePts);
  const distEndM = haversine(usePts[0].lat, usePts[0].lon, usePts[usePts.length - 1].lat, usePts[usePts.length - 1].lon);
  const closed = distEndM < 2000;

  const { pathData, thumbnailPath } = projectToCanvas(usePts, closed);

  if (!pathData) return null;

  return {
    id: `custom-${Date.now()}`,
    name: name,
    description: `自定义路线: ${name}`,
    region: '自定义',
    difficulty: 'medium',
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
}
