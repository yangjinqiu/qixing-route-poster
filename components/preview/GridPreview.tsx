'use client';

import { useRef, useEffect, useState } from 'react';
import { useApp } from '@/components/AppContext';
import { renderPreview } from '@/lib/canvas-engine';

export default function GridPreview() {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgs, setImgs] = useState<(HTMLImageElement | null)[]>(Array(9).fill(null));
  const prevKey = useRef('');

  // Step 1: Load images into React state (only when photos actually change)
  useEffect(() => {
    const key = state.photos.map(p => p?.dataUrl ?? '').join('|');
    if (key === prevKey.current) return;
    prevKey.current = key;

    const arr: (HTMLImageElement | null)[] = Array(9).fill(null);
    let todo = 0;
    state.photos.forEach((p, i) => {
      if (!p) return;
      todo++;
      const img = new Image();
      img.onload = () => { arr[i] = img; todo--; if (todo <= 0) setImgs([...arr]); };
      img.onerror = () => { todo--; if (todo <= 0) setImgs([...arr]); };
      img.src = p.dataUrl;
    });
    if (todo === 0) setImgs(arr);
  }, [state.photos]);

  // Step 2: Draw to canvas whenever images OR any route param changes
  const tpl = state.selectedTemplate;
  const col = state.routeColor;
  const w   = state.routeWidth;
  const op  = state.routeOpacity;

  useEffect(() => {
    const cvs = canvasRef.current;
    const box = containerRef.current;
    if (!cvs || !box) return;

    const sz = Math.min(box.clientWidth - 32, 600);
    cvs.width = sz;
    cvs.height = sz;
    const ctx = cvs.getContext('2d')!;
    const cnt = imgs.filter(Boolean).length;

    if (cnt > 0 && tpl) {
      ctx.drawImage(renderPreview(imgs, tpl.pathData, col, w, op, sz), 0, 0);
    } else if (cnt > 0) {
      ctx.fillStyle = '#0F172A'; ctx.fillRect(0, 0, sz, sz);
      const c = sz / 3;
      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3), cl = i % 3;
        if (imgs[i]) ctx.drawImage(imgs[i]!, cl * c, r * c, c, c);
        else { ctx.fillStyle = '#1E293B'; ctx.fillRect(cl * c, r * c, c, c); }
      }
    } else {
      ctx.fillStyle = '#F1F5F9'; ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#94A3B8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('上传照片并选择路线模板后预览', sz / 2, sz / 2);
    }
  }, [imgs, tpl, col, w, op]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="mx-auto rounded-lg shadow-md border border-[#E2E8F0]" style={{ maxWidth: '100%' }} />
    </div>
  );
}
