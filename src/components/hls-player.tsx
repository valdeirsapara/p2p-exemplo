"use client";

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function HLSPlayer({ 
  src, 
  className, 
  autoPlay = true,
  muted = true,
  controls = false 
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Verifica se o browser suporta HLS nativamente (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
    // Caso contrário, usa HLS.js
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Erro fatal no HLS:', data);
          // Tenta recuperar
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Erro de rede, tentando reconectar...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Erro de mídia, tentando recuperar...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Erro fatal, destruindo player...');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else {
      console.error('HLS não é suportado neste navegador');
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
    />
  );
}

