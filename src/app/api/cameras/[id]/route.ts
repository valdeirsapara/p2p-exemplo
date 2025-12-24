import { NextResponse } from "next/server";
import { cameras } from "@/lib/recapi-client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await cameras.delete(id);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao deletar câmera:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Erro ao deletar câmera" },
      { status: error.response?.status || 500 }
    );
  }
}

