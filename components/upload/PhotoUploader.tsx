'use client';

import { useRef } from 'react';
import { useApp } from '@/components/AppContext';
import { PhotoItem } from '@/lib/types';
import PhotoGrid from './PhotoGrid';

export default function PhotoUploader() {
  const { state, dispatch, photoCount } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return false;
      if (f.size > 20 * 1024 * 1024) return false;
      return true;
    });

    const emptySlots = state.photos.map((p, i) => (p === null ? i : -1)).filter((i) => i !== -1);
    const filesToUse = validFiles.slice(0, emptySlots.length);

    filesToUse.forEach((file, idx) => {
      const position = emptySlots[idx];
      const reader = new FileReader();
      reader.onload = () => {
        dispatch({ type: 'SET_PHOTO', position, photo: { id: `${Date.now()}-${position}`, dataUrl: reader.result as string, position } });
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > emptySlots.length) alert(`只能上传 ${emptySlots.length} 张图片，多余的已忽略`);
    if (files.length > validFiles.length) alert('部分文件格式不支持或超过 20MB 限制，已跳过');
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">照片</h2>
        <span className={`text-xs tabular-nums ${photoCount === 9 ? 'text-emerald-500 font-medium' : 'text-gray-400'}`}>{photoCount} / 9</span>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleBulkUpload} className="hidden" />

      <PhotoGrid />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={photoCount >= 9}
        className="mt-3 w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {photoCount >= 9 ? '已上传 9 张' : '选择照片（可多选 · 拖拽排序）'}
      </button>

      {photoCount > 0 && photoCount < 9 && (
        <p className="mt-1.5 text-xs text-red-400">还需 {9 - photoCount} 张</p>
      )}
    </div>
  );
}
