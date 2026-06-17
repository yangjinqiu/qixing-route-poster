'use client';

import { useState } from 'react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onGalleryView: () => void;
}

export default function DonationModal({ isOpen, onClose, onDownload, onGalleryView }: DonationModalProps) {
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');
  const [generating, setGenerating] = useState<'zip' | 'gallery' | null>(null);

  if (!isOpen) return null;

  const doZip = async () => {
    setGenerating('zip');
    try { await onDownload(); } finally { setGenerating(null); onClose(); }
  };

  const doGallery = async () => {
    setGenerating('gallery');
    try { await onGalleryView(); } finally { setGenerating(null); onClose(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">☕</div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-1">支持一下</h2>
          <p className="text-sm text-[#64748B]">如果这个工具帮到了你，可以请我喝杯咖啡</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab('wechat')}
            className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${activeTab === 'wechat' ? 'bg-[#07C160] text-white shadow-md shadow-[#07C160]/25' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
          >微信支付</button>
          <button onClick={() => setActiveTab('alipay')}
            className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${activeTab === 'alipay' ? 'bg-[#1677FF] text-white shadow-md shadow-[#1677FF]/25' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
          >支付宝</button>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-4 mb-5 flex items-center justify-center min-h-[220px]">
          <div className="w-52 h-52 bg-white rounded-xl flex items-center justify-center border border-[#E2E8F0] shadow-sm overflow-hidden">
            <img
              src={activeTab === 'wechat' ? '/donate/wechat-pay.png' : '/donate/alipay.png'}
              alt={activeTab === 'wechat' ? '微信收款码' : '支付宝收款码'}
              className="w-full h-full object-contain"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                const p = t.parentElement;
                if (p && !p.querySelector('.fallback-text')) {
                  const d = document.createElement('div');
                  d.className = 'fallback-text text-[#94A3B8] text-sm text-center p-4';
                  d.innerHTML = `<p class="font-medium mb-1">${activeTab==='wechat'?'微信收款码':'支付宝收款码'}</p><p class="text-xs">请将图片放入</p><p class="text-xs text-[#CBD5E1]">public/donate/</p>`;
                  p.appendChild(d);
                }
              }}
            />
          </div>
        </div>

        {/* ZIP 下载 */}
        <button onClick={doZip} disabled={!!generating}
          className="w-full py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-[#1E293B] disabled:opacity-50 transition-all shadow-lg shadow-[#0F172A]/20 active:scale-[0.98]"
        >
          {generating === 'zip' ? '生成中...' : '📦 打包下载 (ZIP)'}
        </button>

        {/* 逐张保存 — 手机友好 */}
        <button onClick={doGallery} disabled={!!generating}
          className="w-full mt-2 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8C42] text-white rounded-xl text-sm font-bold hover:from-[#FF5555] hover:to-[#FF7B31] disabled:opacity-50 transition-all shadow-lg shadow-[#FF6B6B]/25 active:scale-[0.98]"
        >
          {generating === 'gallery' ? '生成中...' : '📱 逐张保存 (手机推荐)'}
        </button>

        <p className="text-center text-[11px] text-[#CBD5E1] mt-3">免费下载，无需打赏</p>
      </div>
    </div>
  );
}
