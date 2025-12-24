import { NextResponse } from "next/server";
import { cameras } from "@/lib/recapi-client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await cameras.delete(parseInt(id));
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao deletar câmera:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Erro ao deletar câmera" },
      { status: error.response?.status || 500 }
    );
  }
}

