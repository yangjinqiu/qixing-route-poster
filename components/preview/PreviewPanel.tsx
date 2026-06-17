'use client';

import GridPreview from './GridPreview';
import DownloadButton from './DownloadButton';

export default function PreviewPanel() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">预览</h2>
        <span className="text-[11px] text-gray-400">发布时按 1→9 顺序选择</span>
      </div>

      <GridPreview />

      <div className="mt-4">
        <DownloadButton />
        <p className="text-center text-[10px] text-gray-300 mt-1.5">9 张 1080×1080 PNG · ZIP 压缩包</p>
      </div>
    </div>
  );
}
