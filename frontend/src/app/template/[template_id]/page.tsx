'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Template, RunResult, ApiError } from '@/types';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import VideoPlayer from '@/components/VideoPlayer';
import AssetBrowser from '@/components/AssetBrowser';
import SourceAssets from '@/components/SourceAssets';
import { apiClient } from '@/lib/api-client';

export default function TemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.template_id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [code, setCode] = useState('');
  const [formParams, setFormParams] = useState<Record<string, any>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCustomCode, setIsCustomCode] = useState(false);
  const [fetchingTemplate, setFetchingTemplate] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const data = await apiClient.getTemplate(templateId);
      setTemplate(data);
      setCode(data.code || '');
      setFormParams(data.demo_inputs || {});
    } catch (err) {
      console.error('Failed to load template:', err);
      setError('Failed to load template');
    } finally {
      setFetchingTemplate(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsCustomCode(template ? newCode !== template.code : false);
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!apiClient.getApiKey()) {
        throw new Error('Please enter your VideoDB API key in the header first');
      }

      const isCustom = template ? code !== template.code : false;

      let data: RunResult;
      if (isCustom) {
        data = await apiClient.runCustomCode(code, formParams);
      } else {
        data = await apiClient.runTemplate(templateId, formParams);
      }

      setResult(data);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(`${apiError.message}${apiError.details ? `\n\nDetails: ${apiError.details}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAssets = async () => {
    if (!apiClient.getApiKey()) {
      throw new Error('Please enter your VideoDB API key first');
    }
    return apiClient.listAssets();
  };

  const handleApiKeyChange = (key: string) => {
    apiClient.setApiKey(key);
  };

  const renderField = (field: any) => {
    const value = formParams[field.name] ?? field.default ?? '';

    if (field.type === 'enum' && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => setFormParams({ ...formParams, [field.name]: e.target.value })}
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
          onChange={(e) => setFormParams({ ...formParams, [field.name]: e.target.value })}
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
          onChange={(e) => setFormParams({ ...formParams, [field.name]: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setFormParams({ ...formParams, [field.name]: e.target.value })}
        placeholder={field.type.includes('_id') ? 'asset_id_here' : ''}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    );
  };

  if (fetchingTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading template...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Template not found</p>
          <Link href="/" className="text-accent hover:underline">
            Back to templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with API Key */}
      <Header onApiKeyChange={handleApiKeyChange} />

      {/* Template Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-2xl">
              ←
            </Link>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            {isCustomCode && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Custom Fork
              </span>
            )}
            <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded uppercase">
              {template.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">About Template</h3>
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

          {/* Source Assets */}
          {template.source_assets && template.source_assets.length > 0 && (
            <SourceAssets assets={template.source_assets} />
          )}

          {/* Code Editor */}
          <div className="bg-white rounded-2xl p-6">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              readOnly={false}
            />
          </div>

          {/* Parameters Form */}
          <div className="bg-white rounded-2xl p-6">
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
              <AssetBrowser onLoad={handleLoadAssets} />

              {/* Meme Bank Reference */}
              <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                      🏦 Need popular meme sources?
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Visit the Meme Bank for curated meme videos you can sync to VideoDB with one click
                    </p>
                  </div>
                  <Link
                    href="/meme-bank"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    Go to Meme Bank →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl p-6">
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
      </main>
    </div>
  );
}
