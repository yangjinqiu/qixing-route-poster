'use client';

import { RouteTemplate } from '@/lib/types';
import { useApp } from '@/components/AppContext';

export default function TemplateCard({ template }: { template: RouteTemplate }) {
  const { state, dispatch } = useApp();
  const active = state.selectedTemplate?.id === template.id;

  const diff: Record<string, [string, string]> = { easy: ['休闲', 'bg-emerald-50 text-emerald-600'], medium: ['进阶', 'bg-amber-50 text-amber-600'], hard: ['挑战', 'bg-rose-50 text-rose-600'] };
  const [label, tone] = diff[template.difficulty] || diff.medium;

  return (
    <button onClick={() => dispatch({ type: 'SET_TEMPLATE', template })} className={`template-card flex flex-col items-center gap-1 ${active ? 'active' : ''}`}>
      <div className="template-thumb flex items-center justify-center" style={{ background: active ? '#1f2937' : '#f3f4f6' }}>
        <svg viewBox="0 0 300 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {!active && (
            <>
              <line x1="100" y1="0" x2="100" y2="200" stroke="#e5e7eb" strokeWidth=".5" />
              <line x1="200" y1="0" x2="200" y2="200" stroke="#e5e7eb" strokeWidth=".5" />
              <line x1="0" y1="66" x2="300" y2="66" stroke="#e5e7eb" strokeWidth=".5" />
              <line x1="0" y1="133" x2="300" y2="133" stroke="#e5e7eb" strokeWidth=".5" />
            </>
          )}
          <path d={template.thumbnailPath} fill="none" stroke={active ? '#facc15' : '#6b7280'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-[11px] font-medium text-gray-700 leading-tight">{template.name}</span>
      <span className="text-[9px] text-gray-400">{template.region} · {template.length}</span>
      <span className={`text-[9px] px-1.5 py-0 rounded-full font-medium ${tone}`}>{label}</span>
    </button>
  );
}
