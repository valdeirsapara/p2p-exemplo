import { recapi } from "@/lib/api";
import { cameras } from "@/lib/recapi-client";
import { CameraUpdateRequest } from "@/lib/recapi-types";
import { NextResponse } from "next/server";

export async function PATCH(
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

    const body: Partial<CameraUpdateRequest> = await request.json();
    const response = await cameras.patch(cameraId, body);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar câmera:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Erro ao atualizar câmera" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await recapi.delete(`/camera/${id}/`);
    if (response.status === 204 || response.status === 200) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao deletar câmera:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.response?.data?.message || "Erro ao deletar câmera" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request:Request,{ params }: { params: Promise<{ id: string }> }){
  const { id } = await params
  const response = await cameras.getById(id)
  return NextResponse.json(response)
}
