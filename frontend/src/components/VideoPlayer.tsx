'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamUrl: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
}

export default function VideoPlayer({ 
  streamUrl, 
  autoPlay = true, 
  muted = false,
  className = ""
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    const video = videoRef.current;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Destroy existing HLS instance if any
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // Create new HLS instance
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      // Attach media
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      // Handle events
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, ready to play');
        if (autoPlay) {
          video.play().catch(err => {
            console.log('Autoplay blocked, user interaction required', err);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error, trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For browsers that natively support HLS (Safari)
      video.src = streamUrl;
    } else {
      console.error('HLS is not supported in this browser');
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoPlay]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(streamUrl).then(() => {
      alert('Stream URL copied to clipboard!');
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 relative group">
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay={autoPlay}
          muted={muted}
          className="w-full rounded-lg shadow-inner bg-black"
          style={{ minHeight: className ? 'auto' : '400px', maxHeight: '600px', height: 'auto' }}
        />
      </div>
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <strong className="text-sm">Stream URL:</strong>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Copy
          </button>
        </div>
        <div className="text-xs text-gray-600 break-all">{streamUrl}</div>
      </div>
    </div>
  );
}
