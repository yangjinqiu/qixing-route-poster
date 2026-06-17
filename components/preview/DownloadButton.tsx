'use client';

import { useState, useCallback, useRef } from 'react';
import { useApp } from '@/components/AppContext';
import { renderAllCells } from '@/lib/canvas-engine';
import { downloadZip } from '@/lib/download';
import DonationModal from './DonationModal';

export default function DownloadButton() {
  const { state, allPhotosReady } = useApp();
  const [showDonation, setShowDonation] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);

  const showToastMessage = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const generateImages = useCallback(async (): Promise<Blob[] | null> => {
    if (!state.selectedTemplate) return null;

    const imagePromises = state.photos.map((photo) => {
      if (!photo) return Promise.resolve(null);
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = photo.dataUrl;
      });
    });

    const images = await Promise.all(imagePromises);
    const blobs = await renderAllCells(
      images, state.selectedTemplate.pathData,
      state.routeColor, state.routeWidth, state.routeOpacity,
    );

    if (blobs.some((b) => b === null)) {
      showToastMessage('生成失败，请重试');
      return null;
    }
    return blobs as Blob[];
  }, [state, showToastMessage]);

  // ZIP 下载
  const handleZipDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blobs = await generateImages();
      if (!blobs) return;
      await downloadZip(blobs);
      showToastMessage('下载成功！请按编号顺序发布');
    } catch {
      showToastMessage('下载失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [generateImages, showToastMessage]);

  // 逐张保存 — 打开图片画廊
  const handleGalleryView = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blobs = await generateImages();
      if (!blobs) return;
      const urls = blobs.map((b) => URL.createObjectURL(b));
      setGalleryImages(urls);
    } catch {
      showToastMessage('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [generateImages, showToastMessage]);

  const handleMainClick = () => {
    if (!allPhotosReady) return;
    setShowDonation(true);
  };

  const canDownload = allPhotosReady && !isGenerating;

  return (
    <>
      <button
        onClick={handleMainClick}
        disabled={!canDownload}
        className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-[#1E293B] transition-all shadow-lg shadow-[#0F172A]/20 disabled:bg-[#CBD5E1] disabled:text-[#94A3B8] disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            生成中...
          </span>
        ) : !state.selectedTemplate ? (
          '👆 请先选择线路模板'
        ) : state.photos.filter(Boolean).length < 9 ? (
          `📷 还需上传 ${9 - state.photos.filter(Boolean).length} 张照片`
        ) : (
          '📥 下载图片'
        )}
      </button>

      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        onDownload={handleZipDownload}
        onGalleryView={handleGalleryView}
      />

      {/* 图片画廊 — 逐张长按保存 */}
      {galleryImages && (
        <div className="modal-overlay" onClick={() => { galleryImages.forEach(URL.revokeObjectURL); setGalleryImages(null); }}>
          <div className="modal-content !max-w-lg !max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">长按图片保存到相册</h3>
              <button
                onClick={() => { galleryImages.forEach(URL.revokeObjectURL); setGalleryImages(null); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {galleryImages.map((url, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-gray-400 mb-1">第 {i + 1} 张</p>
                  <img src={url} alt={`第${i+1}张`} className="w-full rounded-lg shadow-sm" />
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-4">
              每张图片长按即可保存到相册。发布朋友圈时按 1→9 顺序选择。
            </p>
          </div>
        </div>
      )}

      {showToast && <div className="toast">{toastMessage}</div>}
    </>
  );
}
