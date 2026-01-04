'use client';

import { useState } from 'react';
import type { Template, ParamSchema, RunResult, ApiError } from '../types';
import VideoPlayer from './VideoPlayer';
import AssetBrowser from './AssetBrowser';

interface TemplateDetailProps {
  template: Template;
  onRun: (params: Record<string, any>) => Promise<RunResult>;
  onLoadAssets: () => Promise<any>;
}

export default function TemplateDetail({ template, onRun, onLoadAssets }: TemplateDetailProps) {
  const [params, setParams] = useState<Record<string, any>>(template.demo_inputs || {});
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await onRun(params);
      setResult(data);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(`${apiError.message}${apiError.details ? `\n\nDetails: ${apiError.details}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: ParamSchema) => {
    const value = params[field.name] ?? field.default ?? '';

    if (field.type === 'enum' && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {field.options.map((option) => (
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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{template.name}</h2>
            <p className="text-gray-600 mt-1">{template.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {template.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full uppercase">
            {template.difficulty}
          </div>
        </div>
      </div>

      {/* Parameters Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Inputs</h3>
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
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Template'}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <AssetBrowser onLoad={onLoadAssets} />
        </div>
      </div>

      {/* Output */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
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
            Run a template to see the result.
          </div>
        )}
      </div>

      {/* Code Viewer */}
      {template.code && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">Template Code (Read Only)</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-96">
            {template.code}
          </pre>
        </div>
      )}
    </div>
  );
}
