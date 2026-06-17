'use client';

import { useState, useEffect } from 'react';

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('qixing_welcome_seen');
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('qixing_welcome_seen', '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="text-center mb-5">
          <span className="text-3xl">🚴</span>
          <h2 className="text-lg font-semibold text-gray-800 mt-2">欢迎使用骑行 · 线路九宫格</h2>
          <p className="text-xs text-gray-400 mt-1">三步生成你的骑行线路九宫格</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-medium">1</span>
            <div>
              <p className="text-sm font-medium text-gray-700">上传 9 张照片</p>
              <p className="text-xs text-gray-400 mt-0.5">拖拽或点击上传，可拖拽调整排序</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-medium">2</span>
            <div>
              <p className="text-sm font-medium text-gray-700">选择或上传骑行线路</p>
              <p className="text-xs text-gray-400 mt-0.5">预设线路一键选中，也支持上传 GPX 文件</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-medium">3</span>
            <div>
              <p className="text-sm font-medium text-gray-700">调整样式 & 下载</p>
              <p className="text-xs text-gray-400 mt-0.5">调线路颜色粗细，预览满意后打包下载 9 张高清图</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
          <p className="text-[11px] text-amber-700">
            💡 <strong>提示：</strong>发布朋友圈时按 1→9 顺序选择图片，线路会跨图无缝衔接！
          </p>
        </div>

        <button
          onClick={dismiss}
          className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          开始使用
        </button>
      </div>
    </div>
  );
}
