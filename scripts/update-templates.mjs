/**
 * 一键更新线路模板
 * Usage: node scripts/update-templates.mjs
 *
 * 放到 public/templates/ 下的 GPX 文件，如果是新路线 → 生成 JSON + 自动注册
 * 如果 JSON 已存在但未注册 → 自动注册
 * 完全重复的（内容被已有路线覆盖）→ 跳过
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const GPX_DIR = join(ROOT, 'public', 'templates');
const OUT_DIR = join(ROOT, 'data', 'templates');
const TS_FILE = join(ROOT, 'lib', 'route-templates.ts');
const CANVAS = 3240;

const IMP_S = '// === AUTO_IMPORTS_START ===';
const IMP_E = '// === AUTO_IMPORTS_END ===';
const ENT_S = '// === AUTO_ENTRIES_START ===';
const ENT_E = '// === AUTO_ENTRIES_END ===';

function sha256(s) { return createHash('sha256').update(s).digest('hex'); }
function haversine(lat1,lon1,lat2,lon2){
  const R=6371000,dLa=(lat2-lat1)*Math.PI/180,dLo=(lon2-lon1)*Math.PI/180;
  return R*2*Math.atan2(Math.sqrt(Math.sin(dLa/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLo/2)**2),Math.sqrt(1-Math.sin(dLa/2)**2-Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLo/2)**2));
}
function parseGpx(c){const re=/<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>(?:\s*<ele>([^<]+)<\/ele>)?/g;let pts=[],m;while((m=re.exec(c))!==null)pts.push({lat:parseFloat(m[1]),lon:parseFloat(m[2]),ele:m[3]?parseFloat(m[3]):0});return pts}

// Load existing hashes + read route-templates.ts for registered imports
const existingHashes = new Set();
if (existsSync(OUT_DIR)) {
  for (const jf of readdirSync(OUT_DIR).filter(f=>f.endsWith('.json'))) {
    try {
      const obj = JSON.parse(readFileSync(join(OUT_DIR,jf),'utf-8'));
      if (obj.pathData) existingHashes.add(sha256(obj.pathData));
    } catch {}
  }
}

let ts = readFileSync(TS_FILE,'utf-8');
const registeredImports = new Set();
for (const m of ts.matchAll(/import\s+([^\s{]+)\s+from/g)) registeredImports.add(m[1]);

const gpxFiles = readdirSync(GPX_DIR).filter(f=>f.endsWith('.gpx'));
if (gpxFiles.length===0){console.log('没有.gpx文件');process.exit(0)}

const imports=[], entries=[];

for (const fname of gpxFiles) {
  const id = fname.replace(/\.gpx$/i, '');
  const jsonFile = `${id}.json`;

  console.log(`处理 ${fname}...`);

  // Check if already registered
  if (registeredImports.has(id)) {
    console.log(`  ⏭  已注册`);
    continue;
  }

  // JSON exists but not registered → register it
  if (existsSync(join(OUT_DIR, jsonFile))) {
    console.log(`  📋 JSON 已存在，注册中...`);
    imports.push(`import ${id} from '@/data/templates/${jsonFile}';`);
    entries.push(`  ${id} as RouteTemplate,`);
    continue;
  }

  // Need to generate JSON
  const content = readFileSync(join(GPX_DIR,fname),'utf-8');
  let pts = parseGpx(content);
  if (pts.length < 2) { console.log(`  ⚠  轨迹点不足`); continue; }
  if (pts.length > 3000) pts = pts.filter((_,i)=>i%Math.ceil(pts.length/3000)===0);

  // Project to canvas
  const lats=pts.map(p=>p.lat),lngs=pts.map(p=>p.lon);
  let mnLat=Math.min(...lats),mxLat=Math.max(...lats),mnLng=Math.min(...lngs),mxLng=Math.max(...lngs);
  const lr=(mxLat-mnLat)||0.001,mr=(mxLng-mnLng)||0.001;
  mnLat-=lr*0.06;mxLat+=lr*0.06;mnLng-=mr*0.06;mxLng+=mr*0.06;
  const step=Math.max(1,Math.floor(pts.length/800));
  const cpts=[];
  for(let i=0;i<pts.length;i+=step)cpts.push([Math.round((pts[i].lon-mnLng)/(mxLng-mnLng)*CANVAS),Math.round(CANVAS-(pts[i].lat-mnLat)/(mxLat-mnLat)*CANVAS)]);
  const last=pts[pts.length-1];cpts.push([Math.round((last.lon-mnLng)/(mxLng-mnLng)*CANVAS),Math.round(CANVAS-(last.lat-mnLat)/(mxLat-mnLat)*CANVAS)]);

  let pd=`M ${cpts[0][0]} ${cpts[0][1]}`;
  for(let i=1;i<cpts.length;i++)pd+=` L ${cpts[i][0]} ${cpts[i][1]}`;
  const closed=haversine(pts[0].lat,pts[0].lon,pts[pts.length-1].lat,pts[pts.length-1].lon)<2000;
  if(closed)pd+=' Z';

  const hash = sha256(pd);
  if (existingHashes.has(hash)) {
    console.log(`  ⏭  内容与已有路线重复`);
    continue;
  }

  let tp='';
  const tw=300,th=200,m=0.1,sx=tw*(1-2*m)/CANVAS,sy=th*(1-2*m)/CANVAS;
  tp=`M ${Math.round(tw*m+cpts[0][0]*sx)} ${Math.round(th*m+cpts[0][1]*sy)}`;
  for(let i=1;i<cpts.length;i++)tp+=` L ${Math.round(tw*m+cpts[i][0]*sx)} ${Math.round(th*m+cpts[i][1]*sy)}`;
  if(closed)tp+=' Z';

  let d=0,g=0;
  for(let i=1;i<pts.length;i++){d+=haversine(pts[i-1].lat,pts[i-1].lon,pts[i].lat,pts[i].lon);if(pts[i].ele>pts[i-1].ele)g+=pts[i].ele-pts[i-1].ele;}
  d=Math.round(d/1000);g=Math.round(g);
  let diff='medium';if(d>=100||g>=2000)diff='hard';else if(d<=30&&g<300)diff='easy';

  writeFileSync(join(OUT_DIR,jsonFile),JSON.stringify({
    id,name:id,description:`${id}骑行线路`,region:'自定义',difficulty:diff,
    length:`${d}km`,startName:'起点',endName:closed?'起点':'终点',
    totalDistance:d,elevationGain:g,startCell:0,endCell:closed?0:8,
    pathData:pd,thumbnailPath:tp,
  }),'utf-8');

  console.log(`  ✅ → ${jsonFile} (${d}km · ${g}m)`);
  imports.push(`import ${id} from '@/data/templates/${jsonFile}';`);
  entries.push(`  ${id} as RouteTemplate,`);
  existingHashes.add(hash);
}

if (imports.length===0){console.log('\n没有需要注册的新模板');process.exit(0)}

// Write back to route-templates.ts
console.log(`\n🔄 注册 ${imports.length} 个模板...`);
ts = readFileSync(TS_FILE,'utf-8');

function esc(s){return s.replace(/[.*+?^${}()|[\]\\/]/g,'\\$&');}
ts = ts.replace(new RegExp(esc(IMP_S)+'[\\s\\S]*?'+esc(IMP_E)),IMP_S+'\n'+imports.join('\n')+'\n'+IMP_E);
ts = ts.replace(new RegExp(esc(ENT_S)+'[\\s\\S]*?'+esc(ENT_E)),ENT_S+'\n'+entries.join('\n')+'\n'+ENT_E);

writeFileSync(TS_FILE,ts,'utf-8');
console.log('🎉 完成！npm run dev 即可');
