'use client';

import { useState } from 'react';
import type { Template, RunResult, ApiError } from '@/types';
import CodeEditor from './CodeEditor';
import VideoPlayer from './VideoPlayer';
import AssetBrowser from './AssetBrowser';

interface TemplateModalProps {
  template: Template;
  onClose: () => void;
  onRun: (code: string, params: Record<string, any>) => Promise<RunResult>;
  onLoadAssets: () => Promise<any>;
}

export default function TemplateModal({ template, onClose, onRun, onLoadAssets }: TemplateModalProps) {
  const [code, setCode] = useState(template.code || '');
  const [params, setParams] = useState<Record<string, any>>(template.demo_inputs || {});
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCustomCode, setIsCustomCode] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsCustomCode(newCode !== template.code);
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await onRun(code, params);
      setResult(data);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(`${apiError.message}${apiError.details ? `\n\nDetails: ${apiError.details}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = params[field.name] ?? field.default ?? '';

    if (field.type === 'enum' && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {field.options.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'color') {
      return (
        <input
          type="color"
          value={value}
          onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          step="any"
          onChange={(e) => setParams({ ...params, [field.name]: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
        placeholder={field.type.includes('_id') ? 'asset_id_here' : ''}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{template.name}</h2>
            {isCustomCode && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Custom Fork
              </span>
            )}
            <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded uppercase">
              {template.difficulty}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-600">{template.description}</p>
            {/* Tags */}
            <div className="flex gap-2 flex-wrap mt-4">
              {template.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            readOnly={false}
          />

          {/* Parameters Form */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3">Parameters</h3>
            <form onSubmit={handleRun} className="space-y-3">
              {template.params_schema?.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Running...' : isCustomCode ? 'Run Custom Code' : 'Run Template'}
                </button>
              </div>
            </form>

            <div className="mt-4">
              <AssetBrowser onLoad={onLoadAssets} />
            </div>
          </div>

          {/* Output */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Output</h3>

            {loading && (
              <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-600">Generating video stream...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 whitespace-pre-wrap">
                {error}
              </div>
            )}

            {result && <VideoPlayer streamUrl={result.stream_url} />}

            {!loading && !error && !result && (
              <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                Run the template to see the result.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
