'use client';

import { useApp } from '@/components/AppContext';
import { getAllTemplates } from '@/lib/route-templates';
import TemplateCard from './TemplateCard';

export default function TemplateSelector() {
  const { state } = useApp();
  const templates = getAllTemplates();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">路线模板</h2>
        {state.selectedTemplate && (
          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{state.selectedTemplate.name}</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {templates.map((t) => <TemplateCard key={t.id} template={t} />)}
      </div>
      {!state.selectedTemplate && <p className="mt-2 text-[11px] text-gray-400 text-center">选择一条路线</p>}
    </div>
  );
}
