'use client';

import type { Template } from '@/types';

interface TemplateListProps {
  templates: Template[];
  selectedId: string | null;
  onSelect: (templateId: string) => void;
}

export default function TemplateList({ templates, selectedId, onSelect }: TemplateListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Templates</h2>
        <span className="text-sm text-gray-500">{templates.length} available</span>
      </div>
      <ul className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {templates.map((template) => (
          <li
            key={template.template_id}
            onClick={() => onSelect(template.template_id)}
            className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
              selectedId === template.template_id
                ? 'border-accent bg-orange-50 shadow-sm ring-2 ring-orange-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
