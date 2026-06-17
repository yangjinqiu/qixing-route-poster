'use client';

import { useRef, useCallback } from 'react';
import { useApp } from '@/components/AppContext';
import { getPresetTemplates } from '@/lib/route-templates';
import { parseGpxFile } from '@/lib/gpx-parser';
import TemplateCard from './TemplateCard';

export default function TemplateSelector() {
  const { state, dispatch } = useApp();
  const presets = getPresetTemplates();
  const gpxInputRef = useRef<HTMLInputElement>(null);

  const handleGpxUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.gpx')) {
      alert('请选择 .gpx 格式的文件');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const xml = reader.result as string;
      const name = file.name.replace(/\.gpx$/i, '');
      const template = parseGpxFile(name, xml);
      if (template) {
        dispatch({ type: 'ADD_CUSTOM_TEMPLATE', template });
      } else {
        alert('无法解析该 GPX 文件，请确认文件格式正确');
      }
    };
    reader.onerror = () => alert('文件读取失败');
    reader.readAsText(file);
    e.target.value = '';
  }, [dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">线路模板</h2>
        {state.selectedTemplate && (
          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
            {state.selectedTemplate.name}
          </span>
        )}
      </div>

      {/* Preset templates */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {presets.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      {/* Custom templates */}
      {state.customTemplates.length > 0 && (
        <>
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-400">自定义</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {state.customTemplates.map((t) => (
              <div key={t.id} className="relative group">
                <TemplateCard template={t} />
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_CUSTOM_TEMPLATE', id: t.id }); }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除此模板"
                >✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* GPX Upload Button */}
      <input
        ref={gpxInputRef}
        type="file"
        accept=".gpx"
        onChange={handleGpxUpload}
        className="hidden"
      />
      <button
        onClick={() => gpxInputRef.current?.click()}
        className="w-full mt-1 py-2 border border-dashed border-gray-200 rounded-lg text-[11px] text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
      >
        + 自定义线路模板（仅支持GPX格式文件）
      </button>

      {!state.selectedTemplate && (
        <p className="mt-2 text-[11px] text-gray-400 text-center">选择一条预设线路或上传 GPX</p>
      )}
    </div>
  );
}
