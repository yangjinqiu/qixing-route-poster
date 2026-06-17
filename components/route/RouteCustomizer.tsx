'use client';

import { useRef } from 'react';
import { PRESET_COLORS } from '@/lib/types';
import { useApp } from '@/components/AppContext';

export default function RouteCustomizer() {
  const { state, dispatch } = useApp();
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* Color */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500">颜色</label>
          <span className="text-[11px] text-gray-400 tabular-nums">{state.routeColor}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button key={c} onClick={() => dispatch({ type: 'SET_ROUTE_COLOR', color: c })}
              className={`color-swatch ${c === '#FFFFFF' ? 'color-swatch-white' : ''} ${state.routeColor === c ? 'active' : ''}`}
              style={{ backgroundColor: c }} title={c} />
          ))}
          <button onClick={() => colorInputRef.current?.click()} className="color-swatch flex items-center justify-center bg-gray-100 hover:bg-gray-200" title="自定义">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>
          </button>
          <input ref={colorInputRef} type="color" value={state.routeColor}
            onChange={(e) => dispatch({ type: 'SET_ROUTE_COLOR', color: e.target.value })}
            className="absolute opacity-0 w-0 h-0" />
        </div>
      </div>

      {/* Width */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-gray-500">粗细</label>
          <span className="text-[11px] text-gray-400 tabular-nums">{state.routeWidth}px</span>
        </div>
        <input type="range" min="2" max="12" value={state.routeWidth}
          onChange={(e) => dispatch({ type: 'SET_ROUTE_WIDTH', width: Number(e.target.value) })} />
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-gray-500">透明度</label>
          <span className="text-[11px] text-gray-400 tabular-nums">{Math.round(state.routeOpacity * 100)}%</span>
        </div>
        <input type="range" min="30" max="100" value={Math.round(state.routeOpacity * 100)}
          onChange={(e) => dispatch({ type: 'SET_ROUTE_OPACITY', opacity: Number(e.target.value) / 100 })} />
      </div>
    </div>
  );
}
