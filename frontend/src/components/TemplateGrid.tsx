'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import type { Template } from '@/types';

interface TemplateGridProps {
  templates: Template[];
}

function VideoPreview({ 
  streamUrl, 
  muted = true, 
  controls = false 
}: { 
  streamUrl: string; 
  muted?: boolean;
  controls?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    if (!videoRef.current || !streamUrl) {
      console.log('VideoPreview: Missing video ref or stream URL', { streamUrl });
      return;
    }

    const video = videoRef.current;
    console.log('VideoPreview: Loading stream', streamUrl);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        debug: false,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('VideoPreview: Manifest parsed, attempting to play');
        setLoading(false);
        video.play().catch((err) => {
          console.log('VideoPreview: Autoplay prevented:', err.message);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('VideoPreview HLS error:', data);
        if (data.fatal) {
          setError(true);
          setLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('VideoPreview: Network error, retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('VideoPreview: Media error, recovering...');
              hls.recoverMediaError();
              break;
            default:
              console.error('VideoPreview: Fatal error, destroying HLS');
              hls.destroy();
              break;
          }
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('VideoPreview: Using native HLS support');
      video.src = streamUrl;
      setLoading(false);
      video.play().catch((err) => {
        console.log('VideoPreview: Autoplay prevented:', err.message);
      });
    } else {
      console.error('VideoPreview: HLS not supported in this browser');
      setError(true);
      setLoading(false);
    }

    // Additional video element event listeners
    video.addEventListener('loadeddata', () => {
      console.log('VideoPreview: Video data loaded');
      setLoading(false);
    });

    video.addEventListener('error', (e) => {
      console.error('VideoPreview: Video element error', e);
      setError(true);
      setLoading(false);
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  return (
    <div className="relative w-full h-full bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/10">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/10">
          <div className="text-gray-400 text-sm">Preview unavailable</div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={muted}
        controls={controls}
        playsInline
        crossOrigin="anonymous"
        className="w-full h-full object-contain"
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
}

function PreviewModal({ streamUrl, onClose }: { streamUrl: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white text-3xl leading-none bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        >
          ×
        </button>
        <VideoPreview 
          streamUrl={streamUrl} 
          muted={false} 
          controls={true} 
        />
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    router.push(`/template/${template.template_id}`);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (template.preview_stream_url) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-accent group"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Preview/Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {template.preview_stream_url ? (
            <VideoPreview streamUrl={template.preview_stream_url} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-sm text-gray-500">Click to edit & run</p>
              </div>
            </div>
          )}

          {/* Play button overlay on hover (centered) */}
          {template.preview_stream_url && (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={handlePreviewClick}
            >
              <button
                className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-accent transition-transform hover:scale-110 shadow-lg"
                onClick={handlePreviewClick}
              >
                <svg
                  className="w-8 h-8 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Template Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded uppercase">
              {template.difficulty}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && template.preview_stream_url && (
        <PreviewModal
          streamUrl={template.preview_stream_url}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

export default function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.template_id} template={template} />
      ))}
    </div>
  );
}
