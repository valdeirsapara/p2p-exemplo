import { NextResponse } from "next/server";
import { cameras } from "@/lib/recapi-client";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const params = {
            serial: url.searchParams.get("serial") || undefined,
            nome: url.searchParams.get("nome") || undefined,
            modelo: url.searchParams.get("modelo") || undefined,
            status: url.searchParams.get("status") || undefined,
            cliente: url.searchParams.get("cliente") || undefined,
        };
        
        const camerasList = await cameras.list(params);
        return NextResponse.json(camerasList);
    } catch (error: any) {
        console.error("Erro ao buscar câmeras:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Erro ao buscar câmeras" },
            { status: error.response?.status || 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCamera = await cameras.create(body);
        return NextResponse.json(newCamera, { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar câmera:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Erro ao criar câmera" },
            { status: error.response?.status || 500 }
        );
    }
}
