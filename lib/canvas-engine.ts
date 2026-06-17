/**
 * Canvas Engine — renders 1080x1080 cells with photo + route overlay.
 * Keeps photos clean: no labels or data cards on the image itself.
 */
import { GRID_SIZE } from './types';

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (ir > cr) { sw = img.naturalHeight * cr; sx = (img.naturalWidth - sw) / 2; }
  else         { sh = img.naturalWidth / cr; sy = (img.naturalHeight - sh) / 2; }
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

function drawRouteLine(ctx: CanvasRenderingContext2D, pathData: string, color: string, opacity: number, lw: number) {
  if (!pathData) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = opacity * 0.3; ctx.strokeStyle = '#000'; ctx.lineWidth = lw + 3;
  try { ctx.stroke(new Path2D(pathData)); } catch {}
  ctx.globalAlpha = opacity * 0.5; ctx.strokeStyle = '#FFF'; ctx.lineWidth = lw + 1;
  try { ctx.stroke(new Path2D(pathData)); } catch {}
  ctx.globalAlpha = opacity; ctx.strokeStyle = color; ctx.lineWidth = lw;
  try { ctx.stroke(new Path2D(pathData)); } catch {}
}

export function renderCell(
  image: HTMLImageElement, fullPathData: string,
  color: string, width: number, opacity: number, cellIndex: number,
): HTMLCanvasElement {
  const SZ = GRID_SIZE;
  const row = Math.floor(cellIndex / 3), col = cellIndex % 3;

  const canvas = document.createElement('canvas');
  canvas.width = SZ; canvas.height = SZ;
  const ctx = canvas.getContext('2d')!;

  drawImageCover(ctx, image, SZ, SZ);

  ctx.save();
  ctx.translate(-col * SZ, -row * SZ);
  ctx.beginPath(); ctx.rect(col * SZ, row * SZ, SZ, SZ); ctx.clip();
  drawRouteLine(ctx, fullPathData, color, opacity, width * 3);
  ctx.restore();

  return canvas;
}

export async function renderAllCells(
  images: (HTMLImageElement | null)[], pathData: string,
  color: string, width: number, opacity: number,
): Promise<(Blob | null)[]> {
  return Promise.all(Array.from({ length: 9 }, (_, i) => {
    if (!images[i]) return Promise.resolve(null);
    return new Promise<Blob>((resolve) => {
      const c = renderCell(images[i]!, pathData, color, width, opacity, i);
      c.toBlob((b) => resolve(b!), 'image/png');
    });
  }));
}

export function renderPreview(
  images: (HTMLImageElement | null)[], fullPathData: string,
  color: string, width: number, opacity: number,
  previewSize: number = 600,
): HTMLCanvasElement {
  const CELL = previewSize / 3;
  const scale = CELL / GRID_SIZE;

  const canvas = document.createElement('canvas');
  canvas.width = previewSize; canvas.height = previewSize;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, previewSize, previewSize);

  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    if (images[i]) {
      const tmp = document.createElement('canvas'); tmp.width = CELL; tmp.height = CELL;
      drawImageCover(tmp.getContext('2d')!, images[i], CELL, CELL);
      ctx.drawImage(tmp, c * CELL, r * CELL);
    } else {
      ctx.fillStyle = '#1E293B'; ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
    }
  }

  const lw = width * 6;
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    ctx.save();
    ctx.translate(c * CELL, r * CELL);
    ctx.scale(scale, scale);
    ctx.beginPath(); ctx.rect(0, 0, GRID_SIZE, GRID_SIZE); ctx.clip();
    ctx.translate(-c * GRID_SIZE, -r * GRID_SIZE);
    drawRouteLine(ctx, fullPathData, color, opacity, lw);
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, previewSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(previewSize, i * CELL); ctx.stroke();
  }

  return canvas;
}
