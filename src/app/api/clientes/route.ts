import { NextResponse } from "next/server";
import { clientes } from "@/lib/recapi-client";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const params = {
            search: url.searchParams.get("search") || undefined,
        };
        
        const clientesList = await clientes.list(params);
        return NextResponse.json(clientesList);
    } catch (error: any) {
        console.error("Erro ao buscar clientes:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Erro ao buscar clientes" },
            { status: error.response?.status || 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCliente = await clientes.create(body);
        return NextResponse.json(newCliente, { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar cliente:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Erro ao criar cliente" },
            { status: error.response?.status || 500 }
        );
    }
}

