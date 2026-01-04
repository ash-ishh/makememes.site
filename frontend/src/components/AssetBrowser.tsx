'use client';

import { useState } from 'react';
import type { AssetsResponse } from '../types';

interface AssetBrowserProps {
  onLoad: () => Promise<AssetsResponse>;
}

export default function AssetBrowser({ onLoad }: AssetBrowserProps) {
  const [assets, setAssets] = useState<AssetsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await onLoad();
      setAssets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const formatAssetList = (items: any[], type: string) => {
    if (items.length === 0) {
      return <em className="text-gray-500">No {type} found</em>;
    }
    return items.map((item) => (
      <div key={item.id} className="py-1">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.id}</code>
        <span className="ml-2 text-sm">{item.name}</span>
        {item.duration && <span className="ml-1 text-xs text-gray-500">({Math.round(item.duration)}s)</span>}
      </div>
    ));
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Memes Collection'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {assets && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto text-sm">
          <div className="mb-3">
            <strong>Videos:</strong>
            <div className="mt-1">{formatAssetList(assets.videos, 'videos')}</div>
          </div>
          <div className="mb-3">
            <strong>Images:</strong>
            <div className="mt-1">{formatAssetList(assets.images, 'images')}</div>
          </div>
          <div>
            <strong>Audio:</strong>
            <div className="mt-1">{formatAssetList(assets.audio, 'audio')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
