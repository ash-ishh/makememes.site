'use client';

import type { SourceAsset } from '../types';

interface SourceAssetsProps {
  assets: SourceAsset[];
}

export default function SourceAssets({ assets }: SourceAssetsProps) {
  if (!assets || assets.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      default:
        return '📁';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="font-semibold text-sm mb-3 text-blue-900">
        📦 Source Assets
      </h4>
      <p className="text-xs text-blue-700 mb-3">
        Download these assets and upload them to your VideoDB collection to use in this template.
      </p>
      <div className="space-y-2">
        {assets.map((asset, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getIcon(asset.type)}</span>
              <div>
                <div className="font-medium text-sm">{asset.name}</div>
                {asset.description && (
                  <div className="text-xs text-gray-500">{asset.description}</div>
                )}
              </div>
            </div>
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </a>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-blue-600">
        💡 Tip: After downloading, upload these to{' '}
        <a
          href="https://console.videodb.io"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-800"
        >
          VideoDB Console
        </a>
        , then copy the asset IDs to use in the parameters below.
      </div>
    </div>
  );
}
