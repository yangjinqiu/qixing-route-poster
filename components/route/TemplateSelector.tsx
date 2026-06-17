'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import { useApp } from '@/components/AppContext';
import { getPresetTemplates } from '@/lib/route-templates';
import { parseGpxFile } from '@/lib/gpx-parser';
import TemplateCard from './TemplateCard';

export default function TemplateSelector() {
  const { state, dispatch } = useApp();
  const presets = getPresetTemplates();
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  // Merge all templates, then filter
  const allTemplates = useMemo(
    () => [...presets, ...state.customTemplates],
    [presets, state.customTemplates]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allTemplates;
    const q = search.toLowerCase();
    return allTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [allTemplates, search]);

  const handleGpxUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [dispatch]
  );

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

      {/* Search box */}
      <div className="relative mb-2">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索线路..."
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 placeholder-gray-300"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Template grid — max 2 rows (6 cards), scrollable beyond */}
      <div className="grid grid-cols-3 gap-2 max-h-[156px] overflow-y-auto pr-0.5">
        {filtered.map((t) => (
          <div key={t.id} className="relative group">
            <TemplateCard template={t} />
            {state.customTemplates.some((ct) => ct.id === t.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'REMOVE_CUSTOM_TEMPLATE', id: t.id });
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                title="删除此模板"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-4 text-center text-[11px] text-gray-400">
            没有匹配的线路
          </div>
        )}
      </div>

      {/* GPX Upload */}
      <input
        ref={gpxInputRef}
        type="file"
        accept=".gpx"
        onChange={handleGpxUpload}
        className="hidden"
      />
      <button
        onClick={() => gpxInputRef.current?.click()}
        className="w-full mt-2 py-2 border border-dashed border-gray-200 rounded-lg text-[11px] text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
      >
        + 自定义线路模板（仅支持GPX格式文件）
      </button>

      {!state.selectedTemplate && (
        <p className="mt-2 text-[11px] text-gray-400 text-center">
          选择一条预设线路或上传 GPX
        </p>
      )}
    </div>
  );
}
