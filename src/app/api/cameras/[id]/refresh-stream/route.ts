import { cameras } from "@/lib/recapi-client";
import { RefreshStreamRequest } from "@/lib/recapi-types";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cameraId = parseInt(id, 10);

    if (isNaN(cameraId)) {
      return NextResponse.json(
        { error: "ID da câmera inválido" },
        { status: 400 }
      );
    }

    let body: RefreshStreamRequest = {};
    try {
      body = await request.json();
    } catch {
      // Body vazio é aceitável
    }

    const response = await cameras.refreshStream(cameraId, body);

    // Se for resposta assíncrona (202), retornar com status 202
    if ('task_id' in response) {
      return NextResponse.json(response, { status: 202 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar stream:", error);

    const status = error.response?.status || 500;
    const message = error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Erro ao atualizar stream da câmera";

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
