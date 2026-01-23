"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Loader2, RefreshCw } from "lucide-react";

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
    controls = false,
}: HLSPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [status, setStatus] = useState<"loading" | "playing" | "error">(
        "loading",
    );
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isReconnecting, setIsReconnecting] = useState(false);
    const retryCountRef = useRef(0);
    const autoReconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const stalledTimerRef = useRef<NodeJS.Timeout | null>(null);
    const maxRetries = 3;
    const autoReconnectDelay = 5000; // 5 seconds between auto-reconnect attempts
    const maxAutoReconnects = 10; // Maximum auto-reconnect attempts before stopping
    const autoReconnectCountRef = useRef(0);
    const initializePlayerRef = useRef<(() => void) | null>(null);

    // Schedule an auto-reconnect attempt
    const scheduleAutoReconnect = useCallback(() => {
        if (autoReconnectCountRef.current >= maxAutoReconnects) {
            console.error("[HLSPlayer] Máximo de reconexões automáticas atingido");
            setStatus("error");
            setErrorMessage("Stream indisponível - Clique para tentar novamente");
            setIsReconnecting(false);
            return;
        }

        setStatus("error");
        setIsReconnecting(true);
        setErrorMessage(
            `Reconectando... (${autoReconnectCountRef.current + 1}/${maxAutoReconnects})`
        );

        if (autoReconnectTimerRef.current) {
            clearTimeout(autoReconnectTimerRef.current);
        }

        autoReconnectTimerRef.current = setTimeout(() => {
            autoReconnectCountRef.current++;
            retryCountRef.current = 0;
            console.log(
                `[HLSPlayer] Reconexão automática ${autoReconnectCountRef.current}/${maxAutoReconnects}`
            );
            initializePlayerRef.current?.();
        }, autoReconnectDelay);
    }, [maxAutoReconnects, autoReconnectDelay]);

    // Function to initialize/reinitialize the HLS player
    const initializePlayer = useCallback(() => {
        const video = videoRef.current;
        if (!video || !src) {
            console.warn("[HLSPlayer] Vídeo ou src não disponível:", {
                video: !!video,
                src,
            });
            setStatus("error");
            setErrorMessage("Player não inicializado");
            return;
        }

        console.log("[HLSPlayer] Inicializando player para:", src);
        setStatus("loading");
        setErrorMessage("");
        setIsReconnecting(false);

        // Clear any pending timers
        if (autoReconnectTimerRef.current) {
            clearTimeout(autoReconnectTimerRef.current);
            autoReconnectTimerRef.current = null;
        }
        if (stalledTimerRef.current) {
            clearTimeout(stalledTimerRef.current);
            stalledTimerRef.current = null;
        }

        // Cleanup anterior
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Verifica se o browser suporta HLS nativamente (Safari)
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[HLSPlayer] Usando HLS nativo do navegador");
            video.src = src;

            const onLoadedMetadata = () => {
                console.log("[HLSPlayer] Metadados carregados");
                setStatus("playing");
                autoReconnectCountRef.current = 0;
            };

            const onError = () => {
                console.error("[HLSPlayer] Erro no vídeo nativo");
                scheduleAutoReconnect();
            };

            video.addEventListener("loadedmetadata", onLoadedMetadata);
            video.addEventListener("error", onError);

            return () => {
                video.removeEventListener("loadedmetadata", onLoadedMetadata);
                video.removeEventListener("error", onError);
            };
        }
        // Caso contrário, usa HLS.js
        else if (Hls.isSupported()) {
            console.log("[HLSPlayer] Usando HLS.js");

            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                debug: false,
                xhrSetup: (xhr, url) => {
                    xhr.timeout = 10000;
                    console.log("[HLSPlayer] Requisitando:", url);
                },
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 3,
                manifestLoadingRetryDelay: 1000,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 4,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
            });

            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("[HLSPlayer] Manifest parseado com sucesso");
                setStatus("playing");
                retryCountRef.current = 0;
                autoReconnectCountRef.current = 0;
            });

            hls.on(Hls.Events.FRAG_LOADED, () => {
                // Reset stalled timer on successful fragment load
                if (stalledTimerRef.current) {
                    clearTimeout(stalledTimerRef.current);
                    stalledTimerRef.current = null;
                }
                if (status !== "playing") {
                    setStatus("playing");
                }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                console.error("[HLSPlayer] Erro HLS:", {
                    type: data.type,
                    details: data.details,
                    fatal: data.fatal,
                    url: data.url,
                    response: data.response,
                });

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn("[HLSPlayer] Erro de rede fatal");
                            if (retryCountRef.current < maxRetries) {
                                retryCountRef.current++;
                                console.log(
                                    `[HLSPlayer] Tentativa ${retryCountRef.current}/${maxRetries} de reconexão...`,
                                );
                                setTimeout(() => {
                                    hls.startLoad();
                                }, 1000 * retryCountRef.current);
                            } else {
                                console.error(
                                    "[HLSPlayer] Máximo de tentativas atingido, agendando reconexão automática",
                                );
                                scheduleAutoReconnect();
                            }
                            break;

                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn(
                                "[HLSPlayer] Erro de mídia fatal, tentando recuperar...",
                            );
                            hls.recoverMediaError();
                            break;

                        default:
                            console.error(
                                "[HLSPlayer] Erro fatal, agendando reconexão automática",
                            );
                            scheduleAutoReconnect();
                            break;
                    }
                } else {
                    // Non-fatal errors that might indicate stream issues
                    if (
                        data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                        data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
                    ) {
                        console.warn(
                            "[HLSPlayer] Erro ao carregar manifest (não fatal)",
                        );
                        scheduleAutoReconnect();
                    } else if (
                        data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR
                    ) {
                        console.warn("[HLSPlayer] Buffer travado, tentando recuperar...");
                        // Try to recover by seeking slightly
                        if (video.currentTime > 0) {
                            video.currentTime = video.currentTime + 0.1;
                        }
                    }
                }
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            // Event listeners do vídeo
            const onPlaying = () => {
                console.log("[HLSPlayer] Vídeo começou a reproduzir");
                setStatus("playing");
                autoReconnectCountRef.current = 0;
                if (stalledTimerRef.current) {
                    clearTimeout(stalledTimerRef.current);
                    stalledTimerRef.current = null;
                }
            };

            const onWaiting = () => {
                console.log("[HLSPlayer] Vídeo aguardando dados...");
            };

            const onStalled = () => {
                console.warn("[HLSPlayer] Vídeo travado (stalled)");
                // Set a timer - if still stalled after 10 seconds, try to reconnect
                if (!stalledTimerRef.current) {
                    stalledTimerRef.current = setTimeout(() => {
                        console.warn("[HLSPlayer] Stall prolongado, tentando reconectar...");
                        if (hlsRef.current) {
                            hlsRef.current.startLoad();
                        }
                        stalledTimerRef.current = null;
                    }, 10000);
                }
            };

            const onEnded = () => {
                console.log("[HLSPlayer] Stream terminou, tentando reconectar...");
                scheduleAutoReconnect();
            };

            video.addEventListener("playing", onPlaying);
            video.addEventListener("waiting", onWaiting);
            video.addEventListener("stalled", onStalled);
            video.addEventListener("ended", onEnded);

            return () => {
                console.log("[HLSPlayer] Limpando recursos");
                video.removeEventListener("playing", onPlaying);
                video.removeEventListener("waiting", onWaiting);
                video.removeEventListener("stalled", onStalled);
                video.removeEventListener("ended", onEnded);
                hls.destroy();
                hlsRef.current = null;
            };
        } else {
            console.error("[HLSPlayer] HLS não é suportado neste navegador");
            setStatus("error");
            setErrorMessage("Navegador não suporta HLS");
        }
    }, [src, status, scheduleAutoReconnect]);

    // Keep the ref updated
    useEffect(() => {
        initializePlayerRef.current = initializePlayer;
    }, [initializePlayer]);

    // Manual retry function
    const handleManualRetry = useCallback(() => {
        console.log("[HLSPlayer] Reconexão manual solicitada");
        autoReconnectCountRef.current = 0;
        retryCountRef.current = 0;
        if (autoReconnectTimerRef.current) {
            clearTimeout(autoReconnectTimerRef.current);
            autoReconnectTimerRef.current = null;
        }
        initializePlayerRef.current?.();
    }, []);

    useEffect(() => {
        const cleanup = initializePlayer();

        return () => {
            cleanup?.();
            if (autoReconnectTimerRef.current) {
                clearTimeout(autoReconnectTimerRef.current);
            }
            if (stalledTimerRef.current) {
                clearTimeout(stalledTimerRef.current);
            }
        };
    }, [src]); // Only re-run when src changes, not on every initializePlayer change

    return (
        <div className="relative">
            <video
                ref={videoRef}
                className={className}
                controls={controls}
                autoPlay={autoPlay}
                muted={muted}
                playsInline
                style={{ backgroundColor: "#000" }}
            />

            {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 className="size-8 animate-spin" />
                        <span className="text-sm">Carregando stream...</span>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                    <div className="flex flex-col items-center gap-2 text-white text-center p-4">
                        {isReconnecting ? (
                            <>
                                <Loader2 className="size-6 animate-spin" />
                                <span className="text-sm">{errorMessage}</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm">{errorMessage}</span>
                                <button
                                    onClick={handleManualRetry}
                                    className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm"
                                >
                                    <RefreshCw className="size-4" />
                                    Tentar novamente
                                </button>
                            </>
                        )}
                        <span className="text-xs text-gray-400 max-w-full truncate">{src}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
