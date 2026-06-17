'use client';

import { useState, useCallback } from 'react';
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

  const showToastMessage = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleDownloadClick = () => {
    if (!allPhotosReady) return;
    setShowDonation(true);
  };

  const handleGenerateAndDownload = useCallback(async () => {
    if (!state.selectedTemplate) return;

    setIsGenerating(true);
    try {
      const imagePromises = state.photos.map((photo) => {
        if (!photo) return Promise.resolve(null);
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = photo.dataUrl;
        });
      });

      const images = await Promise.all(imagePromises);

      const blobs = await renderAllCells(
        images,
        state.selectedTemplate.pathData,
        state.routeColor,
        state.routeWidth,
        state.routeOpacity,
      );

      if (blobs.some((b) => b === null)) {
        showToastMessage('部分图片生成失败，请重试');
        return;
      }

      await downloadZip(blobs);
      showToastMessage('下载成功！请按编号顺序发布到朋友圈');
    } catch (err) {
      console.error('Download error:', err);
      showToastMessage('下载失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [state, showToastMessage]);

  const canDownload = allPhotosReady && !isGenerating;

  return (
    <>
      <button
        onClick={handleDownloadClick}
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
          '📥 下载 9 张图片'
        )}
      </button>

      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        onDownload={handleGenerateAndDownload}
      />

      {showToast && (
        <div className="toast">{toastMessage}</div>
      )}
    </>
  );
}
