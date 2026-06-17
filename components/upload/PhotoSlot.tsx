'use client';

import { useRef, useCallback } from 'react';
import { useApp } from '@/components/AppContext';
import { PhotoItem } from '@/lib/types';

interface PhotoSlotProps {
  position: number;
  onDragStart: (pos: number) => void;
  onDragOver: (pos: number) => void;
  onDrop: (pos: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export default function PhotoSlot({ position, onDragStart, onDragOver, onDrop, isDragging, isDragOver }: PhotoSlotProps) {
  const { state, dispatch } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const photo = state.photos[position];

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { alert('仅支持 JPG/PNG/WebP'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('图片不能超过 20MB'); return; }

    const reader = new FileReader();
    reader.onload = () => dispatch({ type: 'SET_PHOTO', position, photo: { id: `${Date.now()}-${position}`, dataUrl: reader.result as string, position } });
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [dispatch, position]);

  return (
    <div
      onClick={handleClick}
      draggable={!!photo}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(position)); onDragStart(position); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(position); }}
      onDrop={(e) => { e.preventDefault(); onDrop(position); }}
      onDragEnd={() => onDragStart(-1)}
      className={`relative aspect-square rounded-md cursor-pointer overflow-hidden group transition-all duration-150
        ${photo ? 'border border-gray-200 hover:border-gray-300' : 'border border-dashed border-gray-200 hover:border-gray-300 bg-gray-50'}
        ${isDragging ? 'photo-slot-dragging' : ''} ${isDragOver ? 'photo-slot-dragover' : ''}`}
      title={photo ? '拖拽排序 · 点击换图' : '点击上传'}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />

      {photo ? (
        <>
          <img src={photo.dataUrl} alt={`照片 ${position + 1}`} className="w-full h-full object-cover" draggable={false} />
          <span className="absolute top-1 left-1 bg-black/50 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{position + 1}</span>
          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_PHOTO', position }); }}
            className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
          <span className="text-[10px] mt-0.5">{position + 1}</span>
        </div>
      )}
    </div>
  );
}
