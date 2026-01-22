"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";

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
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    useEffect(() => {
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

        // Cleanup anterior
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Verifica se o browser suporta HLS nativamente (Safari)
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[HLSPlayer] Usando HLS nativo do navegador");
            video.src = src;

            video.addEventListener("loadedmetadata", () => {
                console.log("[HLSPlayer] Metadados carregados");
                setStatus("playing");
            });

            video.addEventListener("error", (e) => {
                console.error("[HLSPlayer] Erro no vídeo nativo:", e);
                setStatus("error");
                setErrorMessage("Erro ao carregar stream");
            });
        }
        // Caso contrário, usa HLS.js
        else if (Hls.isSupported()) {
            console.log("[HLSPlayer] Usando HLS.js");

            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                debug: false,
                xhrSetup: (xhr, url) => {
                    // Adiciona timeout e configurações CORS
                    xhr.timeout = 10000; // 10 segundos
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
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
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
                                    "[HLSPlayer] Máximo de tentativas atingido",
                                );
                                setStatus("error");
                                setErrorMessage(
                                    "Erro de rede - Stream indisponível",
                                );
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
                                "[HLSPlayer] Erro fatal irrecuperável",
                            );
                            setStatus("error");
                            setErrorMessage("Stream não disponível");
                            hls.destroy();
                            break;
                    }
                } else {
                    // Erros não fatais
                    if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                        console.warn(
                            "[HLSPlayer] Erro ao carregar manifest (não fatal)",
                        );
                        setStatus("error");
                        setErrorMessage(
                            "Manifest não encontrado - Stream pode não estar ativo",
                        );
                    }
                }
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            // Event listeners do vídeo
            video.addEventListener("playing", () => {
                console.log("[HLSPlayer] Vídeo começou a reproduzir");
                setStatus("playing");
            });

            video.addEventListener("waiting", () => {
                console.log("[HLSPlayer] Vídeo aguardando dados...");
            });

            video.addEventListener("stalled", () => {
                console.warn("[HLSPlayer] Vídeo travado (stalled)");
            });

            return () => {
                console.log("[HLSPlayer] Limpando recursos");
                hls.destroy();
                hlsRef.current = null;
            };
        } else {
            console.error("[HLSPlayer] HLS não é suportado neste navegador");
            setStatus("error");
            setErrorMessage("Navegador não suporta HLS");
        }

        return () => {
            // Cleanup event listeners para HLS nativo
            video.removeEventListener("loadedmetadata", () => {});
            video.removeEventListener("error", () => {});
        };
    }, [src]);

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
                        <span className="text-sm">{errorMessage}</span>
                        <span className="text-xs text-gray-400">{src}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
