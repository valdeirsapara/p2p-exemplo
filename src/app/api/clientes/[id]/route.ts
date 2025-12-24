import { NextResponse } from "next/server";
import { clientes } from "@/lib/recapi-client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await clientes.delete(parseInt(id));
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Erro ao deletar cliente" },
      { status: error.response?.status || 500 }
    );
  }
}

