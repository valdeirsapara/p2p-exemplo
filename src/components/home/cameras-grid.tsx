"use client";

import { useEffect, useState } from "react";
import { Camera } from "@/lib/recapi-types";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { env } from "@/env";
import { HLSPlayer } from "../hls-player";
import { Skeleton } from "../ui/skeleton";

interface CamerasGridProps {
    refreshKey?: number;
}

export function CamerasGrid({ refreshKey }: CamerasGridProps) {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCameras() {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get("/api/cameras");
                setCameras(response.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    setError("Erro de autenticação: Token inválido ou não configurado. Verifique a variável RECAPI_TOKEN no arquivo .env.local");
                } else {
                    setError(err.response?.data?.message || "Erro ao carregar câmeras");
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchCameras();
    }, [refreshKey]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full aspect-video" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {cameras.map((camera) => {
                const streamUrl = camera.streaming_url 
                    ? `${env.NEXT_PUBLIC_RECAPI_URL}${camera.streaming_url}`
                    : null;

                return (
                    <Card key={camera.id || camera.slug || camera.serial}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{camera.nome}</CardTitle>
                                    <CardDescription>{camera.serial}</CardDescription>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        camera.status
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    }`}
                                >
                                    {camera.status ? "Ativa" : "Inativa"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {streamUrl ? (
                                <HLSPlayer 
                                    src={streamUrl}
                                    className="w-full aspect-video rounded-lg"
                                />
                            ) : (
                                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center">
                                    <p className="text-muted-foreground">Stream não disponível</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}