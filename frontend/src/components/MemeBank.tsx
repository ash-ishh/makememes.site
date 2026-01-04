'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import VideoPlayer from './VideoPlayer';

interface MemeSource {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  source_url?: string;
  thumbnail_url?: string;
  media_type: string;
  preview?: {
    url: string;
    type: 'hls' | 'mp4';
  } | null;
}

interface MemeWithStatus extends MemeSource {
  assetId?: string;
  assetName?: string;
  status: 'unknown' | 'available' | 'missing';
}

export default function MemeBank() {
  const [memes, setMemes] = useState<MemeWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMeme, setPreviewMeme] = useState<MemeWithStatus | null>(null);

  // Load meme sources from backend on mount
  useEffect(() => {
    loadMemeSources();
  }, []);

  const loadMemeSources = async () => {
    try {
      const sources = await apiClient.listMemeSources();
      setMemes(sources.map(m => ({ ...m, status: 'unknown' as const })));
    } catch (err: any) {
      setError(err.message || 'Failed to load meme sources');
    }
  };

  const checkMemeAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const availability = await apiClient.checkMemeAvailability();

      // Update meme statuses based on backend check
      setMemes(prev => prev.map(meme => ({
        ...meme,
        status: availability[meme.id]?.available ? 'available' : 'missing',
        assetId: availability[meme.id]?.asset_id || undefined,
        assetName: availability[meme.id]?.asset_name || undefined,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to check meme availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (meme: MemeSource) => {
    if (!meme.source_url) {
      setError(`No source URL configured for ${meme.name}.`);
      return;
    }

    setSyncing(meme.id);
    setError(null);
    try {
      const result = await apiClient.syncMemeToCollection(meme.id);

      // Update the meme status
      setMemes(prev => prev.map(m =>
        m.id === meme.id
          ? { ...m, assetId: result.asset_id, assetName: result.name, status: 'available' }
          : m
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to sync meme');
    } finally {
      setSyncing(null);
    }
  };

  const copyToClipboard = (assetId: string, memeId: string) => {
    navigator.clipboard.writeText(assetId);
    setCopiedId(memeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reaction': return '😮';
      case 'format': return '📋';
      case 'classic': return '⭐';
      case 'trending': return '🔥';
      default: return '🎬';
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
            🏦 Meme Bank
          </h3>
          <p className="text-sm text-purple-700 mt-1">
            Popular meme sources ready to use in your templates
          </p>
        </div>
        <button
          onClick={checkMemeAvailability}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {loading ? 'Checking...' : 'Check Availability'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Meme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {memes.map(meme => (
          <div
            key={meme.id}
            className={`bg-white rounded-xl p-4 border-2 transition-all ${
              meme.status === 'available'
                ? 'border-green-300 bg-green-50/50'
                : meme.status === 'missing'
                ? 'border-orange-300'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-2xl">{getCategoryIcon(meme.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{meme.name}</h4>
                    {meme.preview && (
                      <button
                        onClick={() => setPreviewMeme(meme)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
                      >
                        <span className="text-[10px]">▶</span> Preview
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{meme.description}</p>
                </div>
              </div>
              {meme.status === 'available' && (
                <span className="text-green-600 text-xs font-semibold">✓ Available</span>
              )}
            </div>

            {/* Tags */}
            <div className="flex gap-1 flex-wrap mb-3">
              {meme.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Asset ID or Sync Section */}
            {meme.status === 'available' && meme.assetId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded font-mono overflow-hidden text-ellipsis">
                    {meme.assetId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(meme.assetId!, meme.id)}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                  >
                    {copiedId === meme.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                {meme.assetName && (
                  <p className="text-xs text-gray-500 truncate">Asset: {meme.assetName}</p>
                )}
              </div>
            ) : meme.status === 'missing' ? (
              <div className="space-y-2">
                {meme.source_url ? (
                  <>
                    <p className="text-xs text-gray-500">
                      Source configured. Click to sync to your collection.
                    </p>
                    <button
                      onClick={() => handleSync(meme)}
                      disabled={syncing === meme.id}
                      className="w-full px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      {syncing === meme.id ? 'Syncing...' : '⚡ One-Click Sync to VideoDB'}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-red-600">
                    No source URL configured for this meme.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-1">
                Click "Check Availability" to see status
              </div>
            )}
          </div>
        ))}
      </div>

      {memes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No memes found in the bank
        </div>
      )}

      {/* Preview Modal */}
      {previewMeme && previewMeme.preview && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50">
              <div>
                <h3 className="font-bold text-lg text-purple-900">{previewMeme.name}</h3>
                <p className="text-xs text-purple-600">Meme Preview</p>
              </div>
              <button
                onClick={() => setPreviewMeme(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-200 text-purple-900 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="bg-black flex items-center justify-center">
              <VideoPlayer 
                streamUrl={previewMeme.preview.url} 
                autoPlay={true}
                muted={false}
                className="w-full"
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="flex gap-2">
                {previewMeme.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setPreviewMeme(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
