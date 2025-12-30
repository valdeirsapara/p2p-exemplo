import { recapi } from "@/lib/api";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await recapi.delete(`/camera/${id}`)
    console.log(response)
    if (response.status == 204) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Erro ao deletar câmera:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Erro ao deletar câmera" },
      { status: error.response?.status || 500 }
    );
  }
}

