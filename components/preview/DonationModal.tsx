'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function DonationModal({ isOpen, onClose, onDownload }: DonationModalProps) {
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await onDownload();
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">☕</div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-1">支持一下</h2>
          <p className="text-sm text-[#64748B]">如果这个工具帮到了你，可以请我喝杯咖啡</p>
        </div>

        {/* QR Code Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('wechat')}
            className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${
              activeTab === 'wechat'
                ? 'bg-[#07C160] text-white shadow-md shadow-[#07C160]/25'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            微信支付
          </button>
          <button
            onClick={() => setActiveTab('alipay')}
            className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${
              activeTab === 'alipay'
                ? 'bg-[#1677FF] text-white shadow-md shadow-[#1677FF]/25'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            支付宝
          </button>
        </div>

        {/* QR Code Image */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 mb-5 flex items-center justify-center min-h-[220px]">
          <div className="w-52 h-52 bg-white rounded-xl flex items-center justify-center border border-[#E2E8F0] shadow-sm overflow-hidden">
            <img
              src={activeTab === 'wechat' ? '/donate/wechat-pay.png' : '/donate/alipay.png'}
              alt={activeTab === 'wechat' ? '微信收款码' : '支付宝收款码'}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-text')) {
                  const div = document.createElement('div');
                  div.className = 'fallback-text text-[#94A3B8] text-sm text-center p-4';
                  div.innerHTML = `<p class="font-medium mb-1">${activeTab === 'wechat' ? '微信收款码' : '支付宝收款码'}</p><p class="text-xs">请将收款码图片放入</p><p class="text-xs text-[#CBD5E1]">public/donate/${activeTab === 'wechat' ? 'wechat-pay.png' : 'alipay.png'}</p>`;
                  parent.appendChild(div);
                }
              }}
            />
          </div>
        </div>

        {/* One prominent free download button */}
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full py-3.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8C42] text-white rounded-xl text-base font-bold hover:from-[#FF5555] hover:to-[#FF7B31] transition-all shadow-lg shadow-[#FF6B6B]/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              生成中...
            </span>
          ) : (
            '📥 免费下载 9 张图片'
          )}
        </button>

        <p className="text-center text-[11px] text-[#CBD5E1] mt-3">
          无论是否打赏，都可以免费下载所有图片
        </p>
      </div>
    </div>
  );
}
